const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let ellipse;
const FOLLOW_SPEED = 360; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 创建灰色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，初始位置在屏幕中心
  ellipse = this.add.sprite(400, 300, 'ellipse');
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算椭圆与鼠标之间的距离
  const distance = Phaser.Math.Distance.Between(
    ellipse.x, 
    ellipse.y, 
    mouseX, 
    mouseY
  );
  
  // 如果距离大于1像素，则移动椭圆
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      ellipse.x, 
      ellipse.y, 
      mouseX, 
      mouseY
    );
    
    // 计算本帧应该移动的距离（速度 * 时间差）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      ellipse.x = mouseX;
      ellipse.y = mouseY;
    } else {
      // 根据角度和移动距离更新位置
      ellipse.x += Math.cos(angle) * moveDistance;
      ellipse.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);