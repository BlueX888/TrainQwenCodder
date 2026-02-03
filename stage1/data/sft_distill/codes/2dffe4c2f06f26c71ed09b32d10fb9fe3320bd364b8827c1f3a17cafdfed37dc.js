const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 使用 Graphics 生成粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('pinkSquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建粉色方块精灵，初始位置在屏幕中心
  this.square = this.add.sprite(400, 300, 'pinkSquare');
  
  // 设置跟随速度
  this.followSpeed = 300;
  
  // 确保鼠标输入可用
  this.input.mouse.capture = true;
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算方块到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    this.square.x,
    this.square.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于一定阈值时才移动，避免抖动
  if (distance > 1) {
    // 计算方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      this.square.x,
      this.square.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间增量计算移动距离
    const moveDistance = this.followSpeed * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      this.square.x = pointer.x;
      this.square.y = pointer.y;
    } else {
      // 根据角度和移动距离更新位置
      this.square.x += Math.cos(angle) * moveDistance;
      this.square.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);