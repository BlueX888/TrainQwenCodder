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
  // 使用 Graphics 绘制灰色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制五角星（中心点在 50, 50，外半径 50，内半径 25）
  graphics.fillStar(50, 50, 5, 25, 50);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('star', 100, 100);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: star,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧位置）
    duration: 2000,          // 动画持续时间 2 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    loop: -1,                // 无限循环（-1 表示永久循环）
    repeat: 0                // yoyo 模式下不需要额外的 repeat
  });
}

// 启动游戏
new Phaser.Game(config);