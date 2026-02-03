const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let triangle;
let pointer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制一个指向上方的等腰三角形
  graphics.beginPath();
  graphics.moveTo(0, -20);   // 顶点
  graphics.lineTo(-15, 20);  // 左下角
  graphics.lineTo(15, 20);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 40);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 显示提示文字
  this.add.text(10, 10, '移动鼠标，三角形会平滑跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算平滑跟随速度（速度80表示每秒移动80像素）
  // delta 是毫秒，需要转换为秒
  const speed = 80;
  const factor = Math.min(1, (speed * delta) / 1000);
  
  // 使用线性插值实现平滑跟随
  triangle.x = Phaser.Math.Linear(triangle.x, pointer.x, factor);
  triangle.y = Phaser.Math.Linear(triangle.y, pointer.y, factor);
  
  // 可选：让三角形旋转指向移动方向
  const angle = Phaser.Math.Angle.Between(
    triangle.x, 
    triangle.y, 
    pointer.x, 
    pointer.y
  );
  triangle.rotation = angle + Math.PI / 2; // +90度因为三角形默认朝上
}

new Phaser.Game(config);