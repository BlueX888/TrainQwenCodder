const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipse;
let pointer;
const FOLLOW_SPEED = 200; // 每秒移动的像素数

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建白色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(0, 0, 60, 40); // 中心点为(0,0)，宽60，高40
  
  // 生成纹理并创建精灵
  graphics.generateTexture('ellipseTex', 60, 40);
  graphics.destroy();
  
  // 创建椭圆精灵，初始位置在屏幕中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 获取活动指针（鼠标）
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算椭圆中心到指针的距离
  const distance = Phaser.Math.Distance.Between(
    ellipse.x,
    ellipse.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动椭圆（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      ellipse.x,
      ellipse.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，则直接到达目标点
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