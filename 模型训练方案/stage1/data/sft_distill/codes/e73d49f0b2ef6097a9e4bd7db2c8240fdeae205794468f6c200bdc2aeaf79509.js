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
let pointer;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建白色矩形
  rectangle = this.add.graphics();
  rectangle.fillStyle(0xffffff, 1);
  rectangle.fillRect(-25, -25, 50, 50); // 中心点在(0,0)，矩形大小50x50
  
  // 设置初始位置在屏幕中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算跟随速度（120像素/秒）
  const followSpeed = 120;
  
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧应该移动的最大距离
  const maxDistance = followSpeed * deltaSeconds;
  
  // 计算矩形到鼠标的距离
  const dx = pointer.x - rectangle.x;
  const dy = pointer.y - rectangle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 如果距离大于0，进行移动
  if (distance > 0) {
    // 计算移动比例（不超过1）
    const moveRatio = Math.min(maxDistance / distance, 1);
    
    // 平滑移动矩形
    rectangle.x += dx * moveRatio;
    rectangle.y += dy * moveRatio;
  }
}

new Phaser.Game(config);