const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let ellipse;
let ellipseX = 400;
let ellipseY = 300;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建蓝色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillEllipse(0, 0, 60, 40); // 椭圆中心在(0,0)，宽60，高40
  graphics.generateTexture('ellipseTex', 60, 40);
  graphics.destroy();
  
  // 创建椭圆精灵
  ellipse = this.add.sprite(ellipseX, ellipseY, 'ellipseTex');
  
  // 提示文本
  this.add.text(10, 10, '移动鼠标，蓝色椭圆会平滑跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算跟随速度（速度80表示每秒移动80像素）
  // delta是毫秒，需要转换为秒
  const speed = 80;
  const moveDistance = speed * (delta / 1000);
  
  // 计算当前位置到目标位置的距离
  const dx = pointer.x - ellipseX;
  const dy = pointer.y - ellipseY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 如果距离大于移动距离，则按速度移动；否则直接到达目标
  if (distance > moveDistance) {
    // 归一化方向向量并乘以移动距离
    ellipseX += (dx / distance) * moveDistance;
    ellipseY += (dy / distance) * moveDistance;
  } else {
    // 距离很小时直接到达目标位置
    ellipseX = pointer.x;
    ellipseY = pointer.y;
  }
  
  // 更新椭圆位置
  ellipse.setPosition(ellipseX, ellipseY);
}

new Phaser.Game(config);