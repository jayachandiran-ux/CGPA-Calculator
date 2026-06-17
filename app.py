from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Grade point mapping
GRADE_POINTS = {
    'O': 10, 'A+': 9, 'A': 8,
    'B+': 7, 'B': 6, 'C': 5, 'F': 0
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data     = request.get_json()
    subjects = data.get('subjects', [])

    total_points  = 0
    total_credits = 0

    for subject in subjects:
        grade = subject.get('grade', '').strip()
        try:
            credit = float(subject.get('credit', 0))
        except (ValueError, TypeError):
            continue

        if grade not in GRADE_POINTS or credit <= 0:
            continue

        total_points  += GRADE_POINTS[grade] * credit
        total_credits += credit

    if total_credits == 0:
        return jsonify({
            'error': 'No valid subjects found. Please enter a grade and credit for at least one subject.'
        }), 400

    cgpa       = round(total_points / total_credits, 2)
    percentage = round(cgpa * 9.5, 2)

    return jsonify({
        'cgpa':       cgpa,
        'percentage': percentage,
        'credits':    total_credits,
        'message':    'Calculated successfully'
    })

if __name__ == '__main__':
    app.run(debug=True)
