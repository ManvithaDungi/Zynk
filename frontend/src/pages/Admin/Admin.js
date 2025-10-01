import Navbar from "../../components/Navbar/Navbar"
import CRUDForms from "../../components/CRUDForms/CRUDForms"
import "./Admin.css"

const Admin = () => {
  return (
    <div className="admin-page">
      <Navbar />

      <main className="admin-container">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage all aspects of the Zynk application</p>
        </header>

        <CRUDForms />
      </main>
    </div>
  )
}

export default Admin
