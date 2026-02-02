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
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 80, 60); // 绘制矩形
  graphics.generateTexture('yellowRect', 80, 60); // 生成纹理
  graphics.destroy(); // 销毁 graphics 对象
}

function create() {
  // 创建黄色矩形精灵，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'yellowRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 4000,          // 持续时间 4 秒
    yoyo: true,              // 往返效果（到达终点后反向回到起点）
    repeat: -1,              // 无限循环 (-1 表示永远重复)
    ease: 'Linear'           // 线性缓动，匀速移动
  });
  
  // 添加文字说明
  this.add.text(300, 50, 'Yellow Rectangle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  this.add.text(250, 500, 'Moving left to right and back (4s loop)', {
    fontSize: '18px',
    color: '#aaaaaa'
  });
}

new Phaser.Game(config);