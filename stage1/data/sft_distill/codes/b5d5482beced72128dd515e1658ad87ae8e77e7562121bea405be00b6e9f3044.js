const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipse;
let pointer;

function preload() {
  // 使用 Graphics 创建灰色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(50, 50, 80, 60); // 中心点(50,50)，宽80，高60
  graphics.generateTexture('ellipseTex', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 获取鼠标指针
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算椭圆中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    ellipse.x,
    ellipse.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于一个很小的阈值，则移动椭圆
  if (distance > 1) {
    // 计算从椭圆到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      ellipse.x,
      ellipse.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度360像素/秒）
    const moveDistance = (360 * delta) / 1000;
    
    // 如果移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      ellipse.x = pointer.x;
      ellipse.y = pointer.y;
    } else {
      // 根据角度和移动距离计算新位置
      ellipse.x += Math.cos(angle) * moveDistance;
      ellipse.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);