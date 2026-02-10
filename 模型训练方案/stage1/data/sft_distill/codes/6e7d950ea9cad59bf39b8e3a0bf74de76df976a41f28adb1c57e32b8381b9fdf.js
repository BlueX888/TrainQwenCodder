const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 创建青色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（四个三角形或路径）
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，初始位置在屏幕中心
  this.diamond = this.add.sprite(400, 300, 'diamond');
  
  // 存储跟随速度
  this.followSpeed = 300;
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算菱形当前位置到鼠标位置的距离
  const distance = Phaser.Math.Distance.Between(
    this.diamond.x,
    this.diamond.y,
    mouseX,
    mouseY
  );
  
  // 只有当距离大于一个小阈值时才移动，避免抖动
  if (distance > 1) {
    // 计算从菱形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      this.diamond.x,
      this.diamond.y,
      mouseX,
      mouseY
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    // delta 是毫秒，转换为秒
    const moveDistance = this.followSpeed * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      this.diamond.x = mouseX;
      this.diamond.y = mouseY;
    } else {
      // 根据角度和移动距离更新位置
      this.diamond.x += Math.cos(angle) * moveDistance;
      this.diamond.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);