def test_auth_and_student_flow(client):
    # 1. Register a teacher/admin user
    reg_response = client.post(
        "/api/auth/register",
        json={
            "username": "testteacher",
            "email": "teacher@test.com",
            "password": "securepassword123",
            "full_name": "Test Teacher"
        }
    )
    assert reg_response.status_code == 201
    assert reg_response.json()["username"] == "testteacher"

    # 2. Login to get a JWT token
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "testteacher",
            "password": "securepassword123"
        }
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    access_token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # 3. Create a new student profile
    student_response = client.post(
        "/api/students",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@school.edu",
            "enrollment_number": "ENR2026001",
            "date_of_birth": "2008-11-23",
            "class_level": "Grade 11",
            "study_hours_per_week": 12.5,
            "parent_collaboration": 8.0
        },
        headers=headers
    )
    assert student_response.status_code == 201
    student = student_response.json()
    student_id = student["id"]
    assert student["first_name"] == "John"

    # 4. Add an attendance record for the student
    attendance_response = client.post(
        f"/api/students/{student_id}/attendance",
        json={
            "date": "2026-07-19",
            "status": "Present",
            "remarks": "Attended all classes"
        },
        headers=headers
    )
    assert attendance_response.status_code == 201
    assert attendance_response.json()["status"] == "Present"

    # 5. Add a marks record for the student
    marks_response = client.post(
        f"/api/students/{student_id}/marks",
        json={
            "subject": "Mathematics",
            "exam_name": "Chapter 1 Quiz",
            "marks_obtained": 85.0,
            "max_marks": 100.0,
            "date": "2026-07-18"
        },
        headers=headers
    )
    assert marks_response.status_code == 201
    assert marks_response.json()["marks_obtained"] == 85.0

    # 6. Call the /api/predict/{student_id} endpoint
    prediction_response = client.post(
        f"/api/predict/{student_id}",
        headers=headers
    )
    assert prediction_response.status_code == 201
    prediction = prediction_response.json()
    assert "predicted_label" in prediction
    assert "confidence_score" in prediction
    assert prediction["risk_status"] in ["Low", "Medium", "High"]
