import os

def extract_and_save_contents(dir_paths, output_file='combined_output.txt'):
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for dir_path in dir_paths:
            print(f"Scanning: {dir_path}")
            for root, _, files in os.walk(dir_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            outfile.write(f"\n--- FILE: {file_path} ---\n")
                            outfile.write(content)
                    except Exception as e:
                        outfile.write(f"\n--- FILE: {file_path} ---\n")
                        outfile.write(f"[Error reading file: {e}]\n")
    print(f"\nDone. Output written to: {os.path.abspath(output_file)}")

if __name__ == "__main__":
    # Use absolute paths in Windows
    dirs_to_scan = [
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\app",
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\components",
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\config",
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\constants",
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\lib",
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\pages",
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\public",
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\styles",
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\types",
        r"C:\Users\KiranKumar\Downloads\observability_cig\observability_cig\utils",
    ]
    extract_and_save_contents(dirs_to_scan, output_file='all_files_output.txt')
