'use client';

import React from 'react';
import '../styles/MeetingList.css';

const MeetingList = () => {
  return (
    <div className="examples-upcoming-web">
      {/* 왼쪽 네비게이션 레일 */}
      <nav className="navigation-rail">
        <div className="nav-items">
          <div className="nav-item">
            <div className="icon">⭐</div>
            <span>회의 생성</span>
          </div>
          <div className="nav-item">
            <div className="icon">⭐</div>
            <span>음성 녹음</span>
          </div>
          <div className="nav-item">
            <div className="icon">⭐</div>
            <span>전체 노트</span>
          </div>
          <div className="nav-item">
            <div className="icon">⭐</div>
            <span>미정</span>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        {/* 상단 헤더 */}
        <header>
          <h1>Title</h1>
          <div className="header-actions">
            <button className="icon-button">📎</button>
            <button className="icon-button">📅</button>
            <button className="icon-button">⋮</button>
          </div>
        </header>

        {/* 캐러셀 섹션 */}
        <section className="carousel">
          <div className="carousel-item"></div>
          <div className="carousel-item"></div>
          <div className="carousel-item"></div>
          <div className="carousel-item"></div>
        </section>

        {/* 최근 회의 및 전체 노트 섹션 */}
        <section className="recent-meetings">
          <h2>최근 회의 및 전체 노트?</h2>
          <div className="meeting-list">
            <div className="meeting-item">
              <div className="thumbnail"></div>
              <div className="content">
                <h3>회의 이름</h3>
                <p>회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자</p>
              </div>
              <button className="more-button">⋮</button>
            </div>
            <div className="meeting-item">
              <div className="thumbnail"></div>
              <div className="content">
                <h3>회의 이름</h3>
                <p>회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자</p>
              </div>
              <button className="more-button">⋮</button>
            </div>
          </div>
        </section>

        {/* Floating Action Button */}
        <button className="fab">+</button>
      </main>
    </div>
  );
};

export default MeetingList; 