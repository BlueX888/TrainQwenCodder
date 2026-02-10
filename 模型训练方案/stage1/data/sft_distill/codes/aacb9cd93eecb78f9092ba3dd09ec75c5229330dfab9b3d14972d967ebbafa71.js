const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let blueRect;
let pointer;
const followSpeed = 80; // 跟随速度

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建蓝色矩形
  blueRect = this.add.graphics();
  blueRect.fillStyle(0x0000ff, 1); // 蓝色
  blueRect.fillRect(-25, -25, 50, 50); // 以中心点为原点绘制 50x50 的矩形
  
  // 设置初始位置为屏幕中心
  blueRect.x = 400;
  blueRect.y = 300;
  
  // 获取鼠标指针
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算跟随速度（考虑帧率差异）
  const speed = followSpeed * (delta / 1000);
  
  // 计算当前位置到目标位置的距离
  const dx = pointer.x - blueRect.x;
  const dy = pointer.y - blueRect.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 如果距离大于阈值，则移动矩形
  if (distance > 1) {
    // 使用线性插值实现平滑跟随
    // 计算移动比例，确保不会超过目标位置
    const moveRatio = Math.min(speed / distance, 1);
    
    blueRect.x += dx * moveRatio;
    blueRect.y += dy * moveRatio;
  }
}

new Phaser.Game(config);