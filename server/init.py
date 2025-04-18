# app.py
from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import json
from functools import wraps

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///productivity.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'your_productivity_secret_key'  

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    join_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_points = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text, nullable=True)
    profile_img = db.Column(db.String(100), default='default.jpg')
    app_usages = db.relationship('AppUsage', backref='user', lazy=True)
    achievements = db.relationship('UserAchievement', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # productive, social, entertainment, etc.
    points_per_hour = db.Column(db.Integer, default=0)  # points earned/lost per hour of usage
    is_productive = db.Column(db.Boolean, default=False)
    icon = db.Column(db.String(100), default='app_default.png')
    usages = db.relationship('AppUsage', backref='application', lazy=True)

    def __repr__(self):
        return f'<Application {self.name}>'

class AppUsage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    app_id = db.Column(db.Integer, db.ForeignKey('application.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    duration_minutes = db.Column(db.Integer, default=0)
    points_earned = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<AppUsage {self.user_id}:{self.app_id}>'

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    points_reward = db.Column(db.Integer, default=0)
    icon = db.Column(db.String(100), default='achievement_default.png')
    users = db.relationship('UserAchievement', backref='achievement', lazy=True)

    def __repr__(self):
        return f'<Achievement {self.name}>'

class UserAchievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'), nullable=False)
    earned_date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<UserAchievement {self.user_id}:{self.achievement_id}>'

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    user = db.relationship('User', backref=db.backref('posts', lazy=True))

    def __repr__(self):
        return f'<Post {self.id} by {self.user_id}>'

# Initialize database
with app.app_context():
    db.create_all()
    
    # Seed some applications if none exist
    if Application.query.count() == 0:
        productive_apps = [
            {'name': 'VS Code', 'category': 'Development', 'points_per_hour': 50, 'is_productive': True},
            {'name': 'Microsoft Word', 'category': 'Office', 'points_per_hour': 30, 'is_productive': True},
            {'name': 'Microsoft Excel', 'category': 'Office', 'points_per_hour': 40, 'is_productive': True},
            {'name': 'Notion', 'category': 'Productivity', 'points_per_hour': 35, 'is_productive': True},
            {'name': 'Slack', 'category': 'Communication', 'points_per_hour': 20, 'is_productive': True}
        ]
        
        non_productive_apps = [
            {'name': 'Instagram', 'category': 'Social Media', 'points_per_hour': -20, 'is_productive': False},
            {'name': 'TikTok', 'category': 'Social Media', 'points_per_hour': -30, 'is_productive': False},
            {'name': 'YouTube', 'category': 'Entertainment', 'points_per_hour': -15, 'is_productive': False},
            {'name': 'Netflix', 'category': 'Entertainment', 'points_per_hour': -25, 'is_productive': False},
            {'name': 'Twitter', 'category': 'Social Media', 'points_per_hour': -20, 'is_productive': False}
        ]
        
        for app_data in productive_apps + non_productive_apps:
            app = Application(**app_data)
            db.session.add(app)
        
        db.session.commit()
    
    # Seed some achievements if none exist
    if Achievement.query.count() == 0:
        achievements = [
            {'name': 'Productivity Champion', 'description': 'Earn 1000 productivity points', 'points_reward': 200},
            {'name': 'Early Bird', 'description': 'Log productive hours before 8 AM for 5 consecutive days', 'points_reward': 100},
            {'name': 'Focus Master', 'description': 'Use productive applications for 4 hours straight without interruption', 'points_reward': 150},
            {'name': 'Digital Detox', 'description': 'No social media usage for 24 hours', 'points_reward': 100},
            {'name': 'Consistency King', 'description': 'Log productive hours every day for a week', 'points_reward': 200}
        ]
        
        for achievement_data in achievements:
            achievement = Achievement(**achievement_data)
            db.session.add(achievement)
        
        db.session.commit()

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        # Validation
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists')
            return redirect(url_for('register'))
        
        if password != confirm_password:
            flash('Passwords do not match')
            return redirect(url_for('register'))
        
        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_password)
        
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful! Please log in.')
            return redirect(url_for('login'))
        except:
            flash('An error occurred. Please try again.')
            return redirect(url_for('register'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash(f'Welcome back, {user.username}!')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')
            return redirect(url_for('login'))
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    flash('You have been logged out')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    user = User.query.get(session['user_id'])
    
    # Get recent app usage
    recent_usage = AppUsage.query.filter_by(user_id=user.id).order_by(AppUsage.start_time.desc()).limit(5).all()
    
    # Format for display
    usage_data = []
    for usage in recent_usage:
        app = Application.query.get(usage.app_id)
        usage_data.append({
            'app_name': app.name,
            'start_time': usage.start_time,
            'duration': usage.duration_minutes,
            'points': usage.points_earned,
            'is_productive': app.is_productive
        })
    
    # Get total productive and non-productive time
    productive_time = 0
    non_productive_time = 0
    
    for usage in AppUsage.query.filter_by(user_id=user.id).all():
        app = Application.query.get(usage.app_id)
        if app.is_productive:
            productive_time += usage.duration_minutes
        else:
            non_productive_time += usage.duration_minutes
    
    # Get user's achievements
    user_achievements = []
    for ua in user.achievements:
        achievement = Achievement.query.get(ua.achievement_id)
        user_achievements.append({
            'name': achievement.name,
            'description': achievement.description,
            'earned_date': ua.earned_date
        })
    
    return render_template('dashboard.html', 
                          user=user, 
                          usage_data=usage_data,
                          productive_time=productive_time,
                          non_productive_time=non_productive_time,
                          achievements=user_achievements)

@app.route('/leaderboard')
def leaderboard():
    top_users = User.query.order_by(User.total_points.desc()).limit(20).all()
    
    # Get current user's rank if logged in
    user_rank = None
    if 'user_id' in session:
        current_user = User.query.get(session['user_id'])
        higher_ranked_users = User.query.filter(User.total_points > current_user.total_points).count()
        user_rank = higher_ranked_users + 1
    
    return render_template('leaderboard.html', users=top_users, user_rank=user_rank)

@app.route('/track_app_usage', methods=['GET', 'POST'])
@login_required
def track_app_usage():
    applications = Application.query.all()
    
    if request.method == 'POST':
        app_id = request.form['app_id']
        start_time_str = request.form['start_time']
        duration_minutes = int(request.form['duration'])
        notes = request.form.get('notes', '')
        
        # Parse datetime
        start_time = datetime.strptime(start_time_str, '%Y-%m-%dT%H:%M')
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Calculate points
        app = Application.query.get(app_id)
        points_earned = int((duration_minutes / 60) * app.points_per_hour)
        
        # Create new app usage record
        new_usage = AppUsage(
            user_id=session['user_id'],
            app_id=app_id,
            start_time=start_time,
            end_time=end_time,
            duration_minutes=duration_minutes,
            points_earned=points_earned,
            notes=notes
        )
        
        # Update user's total points
        user = User.query.get(session['user_id'])
        user.total_points += points_earned
        
        try:
            db.session.add(new_usage)
            db.session.commit()
            flash(f'App usage tracked! You earned {points_earned} points.')
            
            # Check for achievements
            check_achievements(user.id)
            
            return redirect(url_for('dashboard'))
        except:
            flash('An error occurred. Please try again.')
            return redirect(url_for('track_app_usage'))
    
    return render_template('track_app_usage.html', applications=applications)

@app.route('/profile/<username>')
def profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    
    # Get user's posts
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_date.desc()).all()
    
    # Get app usage statistics
    app_usage_stats = {}
    total_productive_time = 0
    total_non_productive_time = 0
    
    for usage in AppUsage.query.filter_by(user_id=user.id).all():
        app = Application.query.get(usage.app_id)
        
        if app.name not in app_usage_stats:
            app_usage_stats[app.name] = {
                'duration': 0,
                'points': 0,
                'is_productive': app.is_productive
            }
        
        app_usage_stats[app.name]['duration'] += usage.duration_minutes
        app_usage_stats[app.name]['points'] += usage.points_earned
        
        if app.is_productive:
            total_productive_time += usage.duration_minutes
        else:
            total_non_productive_time += usage.duration_minutes
    
    # Format for display
    usage_data = []
    for app_name, stats in app_usage_stats.items():
        usage_data.append({
            'app_name': app_name,
            'duration': stats['duration'],
            'points': stats['points'],
            'is_productive': stats['is_productive']
        })
    
    # Get user's achievements
    achievements = []
    for ua in user.achievements:
        achievement = Achievement.query.get(ua.achievement_id)
        achievements.append({
            'name': achievement.name,
            'description': achievement.description,
            'earned_date': ua.earned_date
        })
    
    return render_template('profile.html', 
                          user=user, 
                          posts=posts,
                          usage_data=usage_data,
                          productive_time=total_productive_time,
                          non_productive_time=total_non_productive_time,
                          achievements=achievements)

@app.route('/create_post', methods=['POST'])
@login_required
def create_post():
    content = request.form['content']
    
    if content:
        new_post = Post(user_id=session['user_id'], content=content)
        
        try:
            db.session.add(new_post)
            db.session.commit()
            flash('Post created successfully!')
        except:
            flash('An error occurred. Please try again.')
    
    return redirect(url_for('dashboard'))

@app.route('/social_feed')
@login_required
def social_feed():
    # Get all posts, ordered by creation date (newest first)
    posts = Post.query.order_by(Post.created_date.desc()).all()
    
    # Format posts for display
    feed_posts = []
    for post in posts:
        user = User.query.get(post.user_id)
        feed_posts.append({
            'id': post.id,
            'username': user.username,
            'content': post.content,
            'created_date': post.created_date,
            'likes': post.likes
        })
    
    return render_template('social_feed.html', posts=feed_posts)

@app.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    user = User.query.get(session['user_id'])
    
    if request.method == 'POST':
        user.bio = request.form['bio']
        
        try:
            db.session.commit()
            flash('Profile updated successfully!')
            return redirect(url_for('profile', username=user.username))
        except:
            flash('An error occurred. Please try again.')
            return redirect(url_for('edit_profile'))
    
    return render_template('edit_profile.html', user=user)

# Helper functions
def check_achievements(user_id):
    user = User.query.get(user_id)
    all_achievements = Achievement.query.all()
    
    for achievement in all_achievements:
        # Skip if user already has this achievement
        if any(ua.achievement_id == achievement.id for ua in user.achievements):
            continue
        
        # Check for specific achievements
        if achievement.name == 'Productivity Champion' and user.total_points >= 1000:
            award_achievement(user.id, achievement.id)
        
        elif achievement.name == 'Digital Detox':
            # Check if no social media apps were used in last 24 hours
            yesterday = datetime.utcnow() - timedelta(days=1)
            social_apps = Application.query.filter_by(category='Social Media').all()
            social_app_ids = [app.id for app in social_apps]
            
            recent_social = AppUsage.query.filter(
                AppUsage.user_id == user.id,
                AppUsage.app_id.in_(social_app_ids),
                AppUsage.start_time >= yesterday
            ).first()
            
            if not recent_social:
                award_achievement(user.id, achievement.id)
        
        # Add more achievement checks here...

def award_achievement(user_id, achievement_id):
    # Check if user already has this achievement
    existing = UserAchievement.query.filter_by(
        user_id=user_id, 
        achievement_id=achievement_id
    ).first()
    
    if not existing:
        new_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id
        )
        
        achievement = Achievement.query.get(achievement_id)
        user = User.query.get(user_id)
        user.total_points += achievement.points_reward
        
        db.session.add(new_achievement)
        db.session.commit()
        
        flash(f'Achievement unlocked: {achievement.name}! You earned {achievement.points_reward} bonus points.')

if __name__ == '__main__':
    app.run(debug=True)
