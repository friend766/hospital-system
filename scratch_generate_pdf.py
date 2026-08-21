import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, KeepTogether
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0F172A"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "MULTI-TENANT HEALTHCARE & PHARMACY SAAS PLATFORM")
            self.drawRightString(612 - 54, 750, "PROJECT SUMMARY REPORT")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, 742, 612 - 54, 742)
            
        # Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 36, "Confidential • Powered by Next.js 16 App Router & MongoDB Atlas")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_str)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 48, 612 - 54, 48)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2563EB'),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=4,
        leftIndent=12
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Document Header Title Card
    story.append(Paragraph("Unified Healthcare & Pharmacy SaaS Platform", title_style))
    story.append(Paragraph("Comprehensive Project Implementation & Architecture Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=15))

    # Executive Summary
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "The <b>Multi-Tenant Hospital & Pharmacy Management SaaS System</b> is an enterprise-grade cloud healthcare platform designed to serve multiple independent hospital tenants with strict data isolation, role-based workflows, automated pharmacy stock management, and recurring subscription billing controls. Built on <b>Next.js 16 (App Router)</b>, <b>Tailwind CSS v4</b>, and <b>MongoDB Atlas</b>, the system seamlessly transitions between single-hospital management and multi-tenant SaaS deployment.",
        body_style
    ))

    # Tech Stack Table
    tech_data = [
        [Paragraph("<b>Component</b>", table_header_style), Paragraph("<b>Technology Stack / Specification</b>", table_header_style)],
        [Paragraph("Frontend Framework", table_cell_style), Paragraph("Next.js 16 (App Router, Turbopack, React 19 Client/Server Components)", table_cell_style)],
        [Paragraph("Styling & Design System", table_cell_style), Paragraph("Tailwind CSS v4, Custom Medical Pattern Canvas, Dual Light/Dark Theme Engine", table_cell_style)],
        [Paragraph("Database & ORM", table_cell_style), Paragraph("MongoDB Atlas Cloud DB, Mongoose ORM with multi-tenant <code>organizationId</code> schema", table_cell_style)],
        [Paragraph("Authentication & Auth Guards", table_cell_style), Paragraph("JWT with HttpOnly Secure Cookies, Next.js Middleware route protection", table_cell_style)],
        [Paragraph("SaaS & Billing Engine", table_cell_style), Paragraph("Multi-Tenant Organization Model, Stripe Subscription Tier Controls (Starter/Pro/Enterprise)", table_cell_style)]
    ]

    t_tech = Table(tech_data, colWidths=[150, 354])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 14))

    # Major Features Accomplished
    story.append(Paragraph("2. Key Milestones & Capabilities Delivered", h1_style))
    
    story.append(Paragraph("<b>A. Multi-Tenant SaaS Data Isolation:</b>", body_style))
    story.append(Paragraph("• Architected <code>models/Organization.js</code> storing tenant metadata (name, slug, plan, limits, status).", bullet_style))
    story.append(Paragraph("• Embedded <code>organizationId</code> across all Mongoose schemas (User, Patient, Doctor, Appointment, MedicalRecord, Prescription, Medicine, Billing).", bullet_style))
    story.append(Paragraph("• Enforced strict server-side scoping in API endpoints so hospital tenants can never view or access data outside their workspace.", bullet_style))

    story.append(Paragraph("<b>B. SaaS Super-Admin Master Console (<code>/super-admin</code>):</b>", body_style))
    story.append(Paragraph("• Built live platform metrics KPI dashboard (Active Tenants, Total Users, Active Doctors, Platform Revenue).", bullet_style))
    story.append(Paragraph("• Integrated 1-click plan dropdown, subscription status lock/unlock toggle, staff limit adjustments, workspace inspector, and tenant purge controls.", bullet_style))

    story.append(Paragraph("<b>C. Self-Service Hospital Onboarding & Registration:</b>", body_style))
    story.append(Paragraph("• Hospital Tenant Registration Wizard at <code>/register-hospital</code> with Starter, Pro, and Enterprise tiers.", bullet_style))
    story.append(Paragraph("• Dynamic Hospital Workspace Selector on <code>/register</code> allowing patients and staff to register under specific hospitals.", bullet_style))

    story.append(Paragraph("<b>D. Real-Time Pharmacy Stock & Medical Inventory:</b>", body_style))
    story.append(Paragraph("• Populated 23+ essential pharmacy stock items with real-time stock deduction, low-stock threshold alerts, and billing integration.", bullet_style))

    story.append(Paragraph("<b>E. Security & UX Enhancements:</b>", body_style))
    story.append(Paragraph("• Browser Autofill Prevention: Inserted dummy hidden trap fields and non-standard input names to stop browser password manager clutter.", bullet_style))
    story.append(Paragraph("• Dual Theme & Medical Canvas: Responsive Light/Dark theme switching with CSS stacking isolation (<code>isolate</code>) for crisp pattern rendering.", bullet_style))

    story.append(Spacer(1, 14))

    # Active Test Accounts Table
    story.append(Paragraph("3. Active Credentials & Tenant Access", h1_style))

    creds_data = [
        [Paragraph("<b>Role</b>", table_header_style), Paragraph("<b>Full Name</b>", table_header_style), Paragraph("<b>Email Address</b>", table_header_style), Paragraph("<b>Password</b>", table_header_style), Paragraph("<b>Tenant Workspace</b>", table_header_style)],
        [Paragraph("Super-Admin", table_cell_style), Paragraph("SaaS SuperAdmin", table_cell_style), Paragraph("superadmin@saas.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Platform Global Console", table_cell_style)],
        [Paragraph("Hospital Admin", table_cell_style), Paragraph("Mehmood Admin", table_cell_style), Paragraph("mehmood123@gmail.com", table_cell_style), Paragraph("ABc123", table_cell_style), Paragraph("Central City Hospital", table_cell_style)],
        [Paragraph("Doctor", table_cell_style), Paragraph("Dr. Sabeeh Ahmed", table_cell_style), Paragraph("sabeeh123@gmail.com", table_cell_style), Paragraph("abc123", table_cell_style), Paragraph("Central City Hospital", table_cell_style)],
        [Paragraph("Doctor", table_cell_style), Paragraph("Dr. Usman Khan", table_cell_style), Paragraph("usman.khan.doc@gmail.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Central City Hospital", table_cell_style)],
        [Paragraph("Doctor", table_cell_style), Paragraph("Dr. Ayesha Malik", table_cell_style), Paragraph("ayesha.malik@hospital.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Central City Hospital", table_cell_style)],
        [Paragraph("Receptionist", table_cell_style), Paragraph("Ali Raza", table_cell_style), Paragraph("ali123@gmail.com", table_cell_style), Paragraph("ABC123", table_cell_style), Paragraph("Central City Hospital", table_cell_style)],
        [Paragraph("Pharmacist", table_cell_style), Paragraph("Awais Ahmad", table_cell_style), Paragraph("awais123@gmail.com", table_cell_style), Paragraph("AbC123", table_cell_style), Paragraph("Central City Hospital", table_cell_style)],
        [Paragraph("Patient", table_cell_style), Paragraph("Ammad Ashraf", table_cell_style), Paragraph("ammad.second7792@gmail.com", table_cell_style), Paragraph("Abc123", table_cell_style), Paragraph("Central City Hospital", table_cell_style)],
        [Paragraph("Patient", table_cell_style), Paragraph("Zainab Fatima", table_cell_style), Paragraph("zainab.fatima@gmail.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Central City Hospital", table_cell_style)],
        [Paragraph("Patient", table_cell_style), Paragraph("Usman Khan", table_cell_style), Paragraph("usman.khan@gmail.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Central City Hospital", table_cell_style)],
        [Paragraph("Hospital Admin", table_cell_style), Paragraph("Quaid Admin", table_cell_style), Paragraph("admin@quaid-e-azam.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Quaid-e-Azam Hospital", table_cell_style)]
    ]

    t_creds = Table(creds_data, colWidths=[70, 95, 140, 75, 124])
    t_creds.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2563EB')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_creds)
    story.append(Spacer(1, 14))

    # Verification & Deployment
    story.append(Paragraph("4. Build Verification & Cloud Deployment", h1_style))
    story.append(Paragraph(
        "• <b>Production Build Status:</b> Executed <code>npm run build</code> successfully compiling all <b>44 static and dynamic routes</b> with zero TypeScript or syntax errors.<br/>"
        "• <b>Version Control:</b> All features, seed scripts, and API updates have been committed to the local Git repository.<br/>"
        "• <b>Vercel Cloud Deployment:</b> Ready for immediate 1-click push via <b>GitHub Desktop</b>.",
        body_style
    ))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == '__main__':
    out_pdf = os.path.join(os.getcwd(), "Multi_Tenant_Hospital_SaaS_Project_Summary.pdf")
    build_pdf(out_pdf)
