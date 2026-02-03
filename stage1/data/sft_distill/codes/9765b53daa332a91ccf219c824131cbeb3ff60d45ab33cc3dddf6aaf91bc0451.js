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

let rectangle;
let rectX = 400;
let rectY = 300;
const FOLLOW_SPEED = 200; // 每秒移动200像素

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建黄色矩形
  rectangle = this.add.graphics();
  rectangle.fillStyle(0xffff00, 1); // 黄色
  rectangle.fillRect(-25, -25, 50, 50); // 中心点在(0,0)，矩形50x50
  
  // 设置初始位置
  rectangle.x = rectX;
  rectangle.y = rectY;
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，黄色矩形会跟随', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  const targetX = pointer.x;
  const targetY = pointer.y;
  
  // 计算矩形当前位置到鼠标位置的距离
  const distance = Phaser.Math.Distance.Between(rectX, rectY, targetX, targetY);
  
  // 如果距离很小，直接停止移动
  if (distance < 1) {
    return;
  }
  
  // 计算移动方向的角度
  const angle = Phaser.Math.Angle.Between(rectX, rectY, targetX, targetY);
  
  // 根据速度和时间差计算本帧应该移动的距离
  // delta 是毫秒，需要转换为秒
  const moveDistance = FOLLOW_SPEED * (delta / 1000);
  
  // 实际移动距离不能超过剩余距离，避免抖动
  const actualMoveDistance = Math.min(moveDistance, distance);
  
  // 计算新位置
  rectX += Math.cos(angle) * actualMoveDistance;
  rectY += Math.sin(angle) * actualMoveDistance;
  
  // 更新矩形位置
  rectangle.x = rectX;
  rectangle.y = rectY;
}

new Phaser.Game(config);