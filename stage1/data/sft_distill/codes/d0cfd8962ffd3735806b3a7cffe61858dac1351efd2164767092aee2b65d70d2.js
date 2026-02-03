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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  
  // 生成纹理
  graphics.generateTexture('greenSquare', 50, 50);
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const square = this.add.sprite(100, 300, 'greenSquare');
  
  // 创建补间动画
  this.tweens.add({
    targets: square,           // 动画目标
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 1000,            // 持续时间 1 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 往返效果（到达终点后反向播放）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    onLoop: function() {
      // 每次循环时的回调（可选）
      console.log('Animation loop completed');
    }
  });
}

// 创建游戏实例
new Phaser.Game(config);