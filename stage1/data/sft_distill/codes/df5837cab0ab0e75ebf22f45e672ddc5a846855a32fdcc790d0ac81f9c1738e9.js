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
  
  // 绘制一个指向上方的三角形（等腰三角形）
  graphics.beginPath();
  graphics.moveTo(0, -20);    // 顶点（上）
  graphics.lineTo(-15, 20);   // 左下角
  graphics.lineTo(15, 20);    // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 40);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算平滑跟随
  // 速度80表示每秒移动80像素的插值速度
  // 转换为每帧的插值因子：speed * delta / 1000
  const lerpFactor = Math.min(1, (80 * delta) / 1000);
  
  // 使用线性插值实现平滑跟随
  triangle.x = Phaser.Math.Linear(triangle.x, pointer.x, lerpFactor);
  triangle.y = Phaser.Math.Linear(triangle.y, pointer.y, lerpFactor);
  
  // 可选：让三角形朝向鼠标方向旋转
  const angle = Phaser.Math.Angle.Between(
    triangle.x, 
    triangle.y, 
    pointer.x, 
    pointer.y
  );
  triangle.rotation = angle + Math.PI / 2; // 加90度因为三角形默认朝上
}

new Phaser.Game(config);