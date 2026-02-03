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
  
  // 绘制星形 (中心点, 5个角, 内半径, 外半径)
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧
    duration: 1000, // 1秒
    yoyo: true, // 启用往返效果（到达终点后返回起点）
    repeat: -1, // 无限循环 (-1 表示永远重复)
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);