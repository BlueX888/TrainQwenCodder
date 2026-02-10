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
  // 使用 Graphics 绘制红色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('redRect', 100, 100);
  graphics.destroy();

  // 创建红色矩形精灵，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'redRect');

  // 记录原始位置
  const originalX = rect.x;
  const originalY = rect.y;

  // 创建抖动动画
  // 通过在短时间内快速改变位置来模拟抖动效果
  this.tweens.add({
    targets: rect,
    x: originalX + 10, // 向右抖动
    y: originalY + 10, // 向下抖动
    duration: 50, // 每次抖动持续 50ms
    ease: 'Linear',
    yoyo: true, // 来回抖动
    repeat: 19, // 重复 19 次（加上初始 1 次，共 20 次往返，总计约 2 秒）
    loop: -1, // 无限循环
    onRepeat: function() {
      // 在每次重复时随机改变抖动方向，增加抖动的随机性
      const randomX = originalX + Phaser.Math.Between(-10, 10);
      const randomY = originalY + Phaser.Math.Between(-10, 10);
      
      this.updateTo('x', randomX, true);
      this.updateTo('y', randomY, true);
    }
  });

  // 添加说明文字
  this.add.text(400, 50, '红色矩形抖动动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '抖动周期: 2秒循环', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);