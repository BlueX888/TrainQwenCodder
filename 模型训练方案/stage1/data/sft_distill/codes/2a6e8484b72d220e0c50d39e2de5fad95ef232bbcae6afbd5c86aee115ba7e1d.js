const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let ellipse;
let pointer;
const followSpeed = 80;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  
  // 生成纹理
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy();
  
  // 创建椭圆精灵，初始位置在屏幕中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 获取指针对象
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move mouse to see ellipse follow', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算跟随速度（每秒移动的像素数转换为每帧移动的距离）
  const speedFactor = followSpeed * (delta / 1000);
  
  // 使用线性插值实现平滑跟随
  // Phaser.Math.Linear(start, end, progress)
  // progress 值越小，跟随越平滑但越慢
  const lerpFactor = Math.min(speedFactor / 100, 1);
  
  ellipse.x = Phaser.Math.Linear(ellipse.x, pointer.x, lerpFactor);
  ellipse.y = Phaser.Math.Linear(ellipse.y, pointer.y, lerpFactor);
}

new Phaser.Game(config);