import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-modal',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="about-modal-container thin-scrollbar smooth-scroll">
      <div class="modal-header">
        <h2>
          <img
            src="assets/images/irish-rugby-ball.png"
            alt="Irish Rugby Ball"
            class="rugby-ball-icon"
            (error)="onImageError($event)"
          />
          Rugby Score Tracker
        </h2>
        <button mat-icon-button (click)="closeModal()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="modal-content">
        <div class="app-info">
          <div class="version-badge">
            <mat-icon>tag</mat-icon>
            <span>Version 1.0.0</span>
          </div>
          <p class="app-description">
            A modern, mobile-first rugby scoring application designed for
            real-time match tracking, statistics management, and beautiful data
            visualization. Built with Angular 19 and featuring a stunning
            glassmorphic UI design.
          </p>
        </div>

        <div class="developer-info">
          <h3>
            <mat-icon>person</mat-icon>
            Developer
          </h3>
          <div class="developer-card">
            <div class="developer-details">
              <h4>Duncan Falconer</h4>
              <p class="developer-title">
                Full-Stack Developer & UI/UX Designer
              </p>
              <p class="developer-bio">
                Passionate about creating beautiful, functional applications
                with modern web technologies. Specializing in Angular,
                TypeScript, and responsive design.
              </p>
            </div>
          </div>
        </div>

        <div class="social-links">
          <h3>
            <mat-icon>link</mat-icon>
            Connect
          </h3>
          <div class="links-grid">
            <a
              href="https://github.com/ddeveloper72"
              target="_blank"
              mat-raised-button
              class="social-link github"
              rel="noopener noreferrer"
            >
              <mat-icon>code</mat-icon>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/duncanfalconer/"
              target="_blank"
              mat-raised-button
              class="social-link linkedin"
              rel="noopener noreferrer"
            >
              <mat-icon>work</mat-icon>
              LinkedIn
            </a>
            <a
              href="https://x.com/DGFalconer"
              target="_blank"
              mat-raised-button
              class="social-link twitter"
              rel="noopener noreferrer"
            >
              <mat-icon>alternate_email</mat-icon>
              X (Twitter)
            </a>
            <a
              href="https://github.com/ddeveloper72/TopScoreRFC"
              target="_blank"
              mat-raised-button
              class="social-link repository"
              rel="noopener noreferrer"
            >
              <mat-icon>source</mat-icon>
              View Source
            </a>
          </div>
        </div>

        <div class="tech-stack">
          <h3>
            <mat-icon>build</mat-icon>
            Built With
          </h3>
          <div class="tech-chips">
            <div class="tech-chip">Angular 19</div>
            <div class="tech-chip">TypeScript</div>
            <div class="tech-chip">Material Design</div>
            <div class="tech-chip">SCSS</div>
            <div class="tech-chip">PWA Ready</div>
            <div class="tech-chip">Responsive</div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <p>&copy; 2025 Duncan Falconer. All rights reserved.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .about-modal-container {
        max-height: 80vh;
        overflow-y: auto;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;

          .rugby-ball-icon {
            width: 30px;
            height: 24px;
            margin-right: 0.5rem;
            vertical-align: middle;
            flex-shrink: 0;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            transition: transform 0.3s ease;
          }

          .rugby-ball-icon:hover {
            transform: scale(1.1);
          }
        }

        .close-btn {
          color: rgba(255, 255, 255, 0.7);

          &:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
      }

      .modal-content {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .app-info {
        .version-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 215, 0, 0.15);
          color: #ffd700;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 215, 0, 0.3);

          mat-icon {
            font-size: 1.2rem;
            width: 1.2rem;
            height: 1.2rem;
          }
        }

        .app-description {
          line-height: 1.6;
          opacity: 0.9;
          font-size: 1rem;
        }
      }

      .developer-info {
        h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 1.2rem;

          mat-icon {
            color: #ffd700;
          }
        }

        .developer-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);

          .developer-details {
            h4 {
              margin: 0 0 0.5rem 0;
              font-size: 1.3rem;
              color: #ffd700;
            }

            .developer-title {
              margin: 0 0 1rem 0;
              color: rgba(255, 255, 255, 0.8);
              font-weight: 500;
            }

            .developer-bio {
              margin: 0;
              line-height: 1.5;
              opacity: 0.9;
            }
          }
        }
      }

      .social-links {
        h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 1.2rem;

          mat-icon {
            color: #ffd700;
          }
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;

          .social-link {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            font-weight: 500;
            border-radius: 25px;
            transition: all 0.3s ease;
            text-decoration: none;
            border: 1px solid rgba(255, 255, 255, 0.2);

            mat-icon {
              font-size: 1.2rem;
              width: 1.2rem;
              height: 1.2rem;
            }

            &.github {
              background: rgba(0, 0, 0, 0.2);
              color: white;

              &:hover {
                background: rgba(0, 0, 0, 0.4);
                transform: translateY(-2px);
              }
            }

            &.linkedin {
              background: rgba(10, 102, 194, 0.2);
              color: #4fc3f7;

              &:hover {
                background: rgba(10, 102, 194, 0.4);
                transform: translateY(-2px);
              }
            }

            &.twitter {
              background: rgba(29, 161, 242, 0.2);
              color: #1da1f2;

              &:hover {
                background: rgba(29, 161, 242, 0.4);
                transform: translateY(-2px);
              }
            }

            &.repository {
              background: rgba(255, 152, 0, 0.2);
              color: #ff9800;

              &:hover {
                background: rgba(255, 152, 0, 0.4);
                transform: translateY(-2px);
              }
            }
          }
        }
      }

      .tech-stack {
        h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 1.2rem;

          mat-icon {
            color: #ffd700;
          }
        }

        .tech-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;

          .tech-chip {
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
            backdrop-filter: blur(5px);
          }
        }
      }

      .modal-footer {
        padding: 1rem 2rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;

        p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.7;
        }
      }

      @media (max-width: 600px) {
        .modal-content {
          padding: 1.5rem;
        }

        .social-links .links-grid {
          grid-template-columns: 1fr;
        }

        .modal-header {
          padding: 1rem 1.5rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
        }
      }
    `,
  ],
})
export class AboutModalComponent {
  constructor(private dialogRef: MatDialogRef<AboutModalComponent>) {}

  closeModal(): void {
    this.dialogRef.close();
  }

  onImageError(event: any): void {
    // Fallback to FontAwesome icon if SVG fails to load
    const imgElement = event.target;
    const iconElement = document.createElement('i');
    iconElement.className = 'fa-solid fa-football fa-2x rugby-ball-fallback';
    iconElement.style.color = '#8b4513'; // Brown rugby ball color
    iconElement.style.marginRight = '0.75rem';

    // Replace the img with the icon
    imgElement.parentNode.replaceChild(iconElement, imgElement);
  }
}
