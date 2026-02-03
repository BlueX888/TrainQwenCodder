const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用Graphics创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('grayBox', 50, 50);
  graphics.destroy();

  // 创建方块精灵，初始位置在画布中心
  this.box = this.add.sprite(400, 300, 'grayBox');
  
  // 设置方块的原点为中心
  this.box.setOrigin(0.5, 0.5);
  
  // 跟随速度（像素/秒）
  this.followSpeed = 360;
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算方块到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    this.box.x,
    this.box.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      this.box.x,
      this.box.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和delta时间计算本帧应移动的距离
    const moveDistance = (this.followSpeed * delta) / 1000;
    
    // 如果移动距离大于剩余距离，直接移动到目标位置
    const actualDistance = Math.min(moveDistance, distance);
    
    // 计算新位置
    this.box.x += Math.cos(angle) * actualDistance;
    this.box.y += Math.sin(angle) * actualDistance;
  }
}

new Phaser.Game(config);