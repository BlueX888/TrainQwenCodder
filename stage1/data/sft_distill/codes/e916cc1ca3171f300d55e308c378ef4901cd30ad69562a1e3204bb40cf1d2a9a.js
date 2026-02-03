const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let ellipse;
let pointer;
const FOLLOW_SPEED = 240; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 绘制白色椭圆并生成纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  graphics.generateTexture('ellipse', 60, 60);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，初始位置在屏幕中心
  ellipse = this.add.sprite(400, 300, 'ellipse');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaSeconds = delta / 1000;
  
  // 获取鼠标位置
  const targetX = pointer.x;
  const targetY = pointer.y;
  
  // 计算椭圆到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    ellipse.x,
    ellipse.y,
    targetX,
    targetY
  );
  
  // 如果距离大于1像素，则移动椭圆
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      ellipse.x,
      ellipse.y,
      targetX,
      targetY
    );
    
    // 计算本帧应该移动的距离
    const moveDistance = Math.min(FOLLOW_SPEED * deltaSeconds, distance);
    
    // 根据角度和距离计算新位置
    ellipse.x += Math.cos(angle) * moveDistance;
    ellipse.y += Math.sin(angle) * moveDistance;
  }
}

new Phaser.Game(config);