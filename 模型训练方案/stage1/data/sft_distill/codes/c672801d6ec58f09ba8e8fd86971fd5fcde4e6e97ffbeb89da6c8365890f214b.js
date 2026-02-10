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
const FOLLOW_SPEED = 80; // 每秒移动80像素

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1); // 蓝色
  graphics.fillEllipse(30, 20, 60, 40); // 椭圆：中心(30,20)，宽60，高40
  
  // 生成纹理
  graphics.generateTexture('ellipseTex', 60, 40);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 获取鼠标指针
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
  
  // 如果距离很小，直接设置位置，避免抖动
  if (distance < 1) {
    ellipse.x = targetX;
    ellipse.y = targetY;
    return;
  }
  
  // 计算这一帧应该移动的距离
  const moveDistance = FOLLOW_SPEED * deltaSeconds;
  
  // 如果移动距离大于实际距离，直接到达目标位置
  if (moveDistance >= distance) {
    ellipse.x = targetX;
    ellipse.y = targetY;
  } else {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      ellipse.x,
      ellipse.y,
      targetX,
      targetY
    );
    
    // 根据角度和移动距离计算新位置
    ellipse.x += Math.cos(angle) * moveDistance;
    ellipse.y += Math.sin(angle) * moveDistance;
  }
}

new Phaser.Game(config);