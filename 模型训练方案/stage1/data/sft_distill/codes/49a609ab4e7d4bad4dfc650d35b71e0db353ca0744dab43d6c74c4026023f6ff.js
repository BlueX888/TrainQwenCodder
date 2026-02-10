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
  // 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('whiteSquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建白色方块精灵，初始位置在左侧
  const square = this.add.sprite(100, 300, 'whiteSquare');
  
  // 创建补间动画
  this.tweens.add({
    targets: square,           // 动画目标对象
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 1000,            // 动画持续时间 1 秒
    yoyo: true,                // 启用往返效果（到达终点后反向播放）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    ease: 'Linear'             // 线性缓动函数，匀速移动
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'White square moving left-right with loop', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);