const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let triangle;
const moveSpeed = 100; // 每秒移动的像素

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6600, 1);
  
  // 绘制一个等边三角形（中心在原点）
  graphics.beginPath();
  graphics.moveTo(0, -20);      // 顶点
  graphics.lineTo(-17.32, 10);  // 左下角
  graphics.lineTo(17.32, 10);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 40, 40);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在场景中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 设置相机跟随三角形
  this.cameras.main.startFollow(triangle, true, 0.1, 0.1);
  
  // 可选：设置相机边界，让场景看起来更大
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 添加背景网格以便更好地观察相机移动
  this.createGrid();
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随三角形移动', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 让三角形向右上方移动
  // delta 是毫秒，需要转换为秒
  const deltaSeconds = delta / 1000;
  
  // 向右移动
  triangle.x += moveSpeed * deltaSeconds;
  
  // 向上移动
  triangle.y -= moveSpeed * deltaSeconds;
  
  // 可选：添加轻微旋转效果
  triangle.rotation += 0.02;
}

// 辅助函数：创建网格背景
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 2000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 2000);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 2000; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(2000, y);
  }
  
  graphics.strokePath();
}

new Phaser.Game(config);