# Dental Staffing Marketplace Demo with Stripe Connect

## 🚀 Project Overview

This project is a full-stack demo of an on-demand dental staffing marketplace, showcasing a common two-sided marketplace model using **Stripe Connect**. It allows clinics to find and book temporary dental professionals (temps), and enables dental professionals to onboard onto the platform and receive payouts via Stripe Express.

The primary goal of this demo is to illustrate:
*   **Clinic Booking Flow:** How a clinic (buyer) can search for available temps, view their profiles, book shifts, and securely pay using saved payment methods via Stripe.
*   **Temp Onboarding Flow:** How a dental professional (seller) can register on the platform and set up their Stripe Express account to receive payouts for their services.
*   **Stripe Connect Integration:** The use of Stripe Connect (Express accounts) for facilitating payments between clinics and temps, including platform fees and payouts.

## ✨ Features

*   **Clinic-side Functionality:**
    *   **Search & Discovery:** Search for dental professionals by profession and location.
    *   **Temp Profiles:** View details of available temps (name, city, profession, hourly rate).
    *   **Shift Booking:** Specify shift date, hours, and lunch breaks.
    *   **Secure Payment Setup:** Add and save payment methods using Stripe Elements and SetupIntents.
    *   **Automated Payments:** Initiate payments for booked shifts using saved payment methods via Stripe Payment Intents.
*   **Temp-side Functionality:**
    *   **Stripe Express Onboarding:** Seamlessly onboard to the platform and connect a Stripe Express account for payouts.
    *   **Dashboard Access:** Direct login links to their Stripe Express Dashboard to manage earnings and account details.
*   **Backend & API:**
    *   **FastAPI Backend:** Robust API for handling business logic, Stripe interactions, and data persistence.
    *   **Stripe Integration:** APIs for creating Express accounts, account links, customers, setup intents, payment intents, and managing webhooks.
    *   **Firebase Firestore:** Simple database for storing temp profiles.
    *   **Stripe Webhooks:** Handles asynchronous events from Stripe (e.g., account updates, payment statuses).

## 🛠️ Technologies Used

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (App Router)
    *   [React](https://react.dev/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [shadcn/ui](https://ui.shadcn.com/)
    *   [Stripe.js](https://stripe.com/docs/js) & [@stripe/react-stripe-js](https://stripe.com/docs/stripe-js/react)
*   **Backend:**
    *   [FastAPI](https://fastapi.tiangolo.com/) (Python)
    *   [Stripe Python Library](https://stripe.com/docs/api/python)
    *   [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) (for Firestore)
    *   [python-dotenv](https://pypi.org/project/python-dotenv/)
*   **Database:**
    *   [Firebase Firestore](https://firebase.google.com/docs/firestore)
*   **Development Tools:**
    *   [Stripe CLI](https://stripe.com/docs/stripe-cli) (for local webhook forwarding)

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js** (LTS version recommended) & **npm** or **Yarn**
*   **Python 3.8+** & **pip**
*   **Stripe CLI**: [Install instructions](https://stripe.com/docs/stripe-cli/install)
*   **Firebase Project**: A Firebase project with Firestore enabled.

### 1. Clone the Repository

```bash
git clone https://github.com/lakhwindersinghx/Stripe-Marketplace.git
