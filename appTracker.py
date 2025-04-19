import time
import pygetwindow as gw
import socket
import pymysql.cursors


# Initialize variables
SERVERPORT = 65432; #SET SERVER PORT NUMBER HERE
current_window = None
start_time = None
app_data = {} #Dictionary that stores app name and amount of time spent on it

# Configure MySQL
conn = pymysql.connect(host='localhost',
                       port=3306,
                       user='root',
                       password='',
                       db='time_tracker',
                       charset='utf8mb4',
                       cursorclass=pymysql.cursors.DictCursor)

def track_app_time():
    global current_window, start_time
    # HOST = "127.0.0.1"  #localhost
    # PORT = SERVERPORT
    # sockfd = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # sockfd.connect((HOST, PORT))
    cursor = conn.cursor
    while True:
        new_window = gw.getActiveWindow()

        if new_window != current_window:
            # Calculate the time spent on the previous window
            if current_window is not None:
                end_time = time.time()
                elapsed_time = end_time - start_time
                app_name = current_window.title

                if app_name in app_data:
                    app_data[app_name] += elapsed_time
                    update_query = ''' '''

                else:
                    app_data[app_name] = elapsed_time
                    insert_query = '''
                    INSERT INTO app_data (app_name, time_spent)
                    VALUES (%s, CONVERT(%s, UNSIGNED))
                    ON DUPLICATE KEY UPDATE time_spent = time_spent + CONVERT(%s, UNSIGNED)
                    '''
                    cursor.execute(insert_query, (app_name, str(elapsed_time), str(elapsed_time)))

                # Save the data to TrackRecords.txt
                with open("TrackRecords.txt", "a") as file:
                    current_datetime = time.strftime("%Y-%m-%d %H:%M:%S")
                    file.write(f"{current_datetime} - Time spent on {app_name}: {elapsed_time:.2f} seconds\n")
                    data = f"{app_name}: {elapsed_time:.2f} seconds\n"
                    # sockfd.sendall(data.encode())

            # Update current window and start time
            current_window = new_window
            start_time = time.time()

        time.sleep(1)  # Check the active window every 1 second

if __name__ == "__main__":
    try:
        track_app_time()
    except KeyboardInterrupt:
        # Print the final app usage data when the script is terminated
        for app, time_spent in app_data.items():
            print(f"Total time spent on {app}: {time_spent:.2f} seconds")
