import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

const DUMMY_CATEGORIES = [
  { _id: "1", name: "Premium Honey", parent: "None", products: 12, status: "Active" },
  { _id: "2", name: "Spices", parent: "None", products: 45, status: "Active" },
  { _id: "3", name: "Whole Spices", parent: "Spices", products: 15, status: "Active" },
  { _id: "4", name: "Oil & Ghee", parent: "None", products: 8, status: "Active" },
  { _id: "5", name: "Dates", parent: "None", products: 5, status: "Inactive" },
];

const columns: Column<any>[] = [
  { header: "Category Name", accessorKey: "name", render: (val) => <span className="font-bold">{val}</span> },
  { header: "Parent Category", accessorKey: "parent" },
  { header: "Products", accessorKey: "products" },
  { header: "Status", accessorKey: "status", render: (val) => (
    <Tag theme={val === "Active" ? "success" : "error"}>{val}</Tag>
  )},
  { header: "Actions", accessorKey: "_id", render: () => (
      <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500 bg-orange-50"><Edit className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50"><Trash2 className="size-4" /></Button>
      </div>
  ) },
];

const CategoriesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <PageWraper 
      title="Categories" 
      description="Organize your products into categories and sub-categories."
      actions={<Button className="bg-primary hover:bg-primary-dark text-white"><Plus className="mr-2 size-4" /> Create Category</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <ReusableTable
          data={DUMMY_CATEGORIES}
          columns={columns}
          pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={10}
          total={5}
        />
      </div>
    </PageWraper>
  );
};

export default CategoriesPage;
