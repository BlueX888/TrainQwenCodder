const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipse;
let pointer;
const followSpeed = 200; // 每秒移动的像素数

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建白色椭圆
  ellipse = this.add.graphics();
  ellipse.fillStyle(0xffffff, 1);
  ellipse.fillEllipse(0, 0, 60, 40); // 中心点为(0,0)，宽60，高40
  
  // 设置椭圆初始位置在屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 获取鼠标指针对象
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差，转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算椭圆当前位置与鼠标位置的距离
  const distance = Phaser.Math.Distance.Between(
    ellipse.x,
    ellipse.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离很小，直接停止移动，避免抖动
  if (distance < 1) {
    return;
  }
  
  // 计算这一帧应该移动的距离
  const moveDistance = followSpeed * deltaSeconds;
  
  // 如果移动距离大于剩余距离，直接到达目标点
  if (moveDistance >= distance) {
    ellipse.x = pointer.x;
    ellipse.y = pointer.y;
  } else {
    // 计算椭圆到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      ellipse.x,
      ellipse.y,
      pointer.x,
      pointer.y
    );
    
    // 根据角度和移动距离更新椭圆位置
    ellipse.x += Math.cos(angle) * moveDistance;
    ellipse.y += Math.sin(angle) * moveDistance;
  }
}

new Phaser.Game(config);