const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let square;
const FOLLOW_SPEED = 300; // 像素/秒

function preload() {
  // 使用 Graphics 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('whiteSquare', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建白色方块，初始位置在屏幕中心
  square = this.add.sprite(400, 300, 'whiteSquare');
  square.setOrigin(0.5, 0.5);
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算方块到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    square.x, 
    square.y, 
    mouseX, 
    mouseY
  );
  
  // 只有当距离大于一定阈值时才移动，避免抖动
  if (distance > 1) {
    // 计算方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      square.x, 
      square.y, 
      mouseX, 
      mouseY
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      square.x = mouseX;
      square.y = mouseY;
    } else {
      // 根据角度和移动距离计算新位置
      square.x += Math.cos(angle) * moveDistance;
      square.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);