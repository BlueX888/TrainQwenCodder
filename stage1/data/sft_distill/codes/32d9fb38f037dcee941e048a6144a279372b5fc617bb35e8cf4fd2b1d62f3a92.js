// Phaser3 补间动画示例：红色矩形左右往返循环
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建红色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillRect(0, 0, 80, 60); // 绘制矩形（相对于自身坐标系）
  
  // 设置矩形初始位置（左侧）
  graphics.x = 50;
  graphics.y = 270; // 垂直居中
  
  // 创建补间动画
  this.tweens.add({
    targets: graphics,        // 动画目标对象
    x: 670,                   // 目标 x 坐标（右侧，800 - 80 - 50）
    duration: 3000,           // 持续时间 3 秒
    ease: 'Linear',           // 线性缓动
    yoyo: true,               // 启用往返（到达终点后反向播放）
    repeat: -1                // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(300, 50, '红色矩形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

// 启动游戏
new Phaser.Game(config);