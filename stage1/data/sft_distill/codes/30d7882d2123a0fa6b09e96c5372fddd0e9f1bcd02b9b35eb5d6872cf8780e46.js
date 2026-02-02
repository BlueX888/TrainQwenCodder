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
  // 无需预加载外部资源
}

function create() {
  // 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('orangeBox', 50, 50);
  graphics.destroy();

  // 方块计数器
  let boxCount = 0;
  const maxBoxes = 5;

  // 创建定时器事件，每2秒生成一个方块
  const timerEvent = this.time.addEvent({
    delay: 2000, // 2秒
    callback: () => {
      // 生成随机位置
      const randomX = Phaser.Math.Between(25, 775);
      const randomY = Phaser.Math.Between(25, 575);

      // 创建橙色方块
      const box = this.add.image(randomX, randomY, 'orangeBox');
      
      // 添加简单的缩放动画效果
      box.setScale(0);
      this.tweens.add({
        targets: box,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });

      // 增加计数
      boxCount++;

      // 在控制台输出生成信息
      console.log(`生成第 ${boxCount} 个方块，位置: (${randomX}, ${randomY})`);

      // 达到最大数量时移除定时器
      if (boxCount >= maxBoxes) {
        timerEvent.remove();
        console.log('已生成5个方块，停止生成');
      }
    },
    callbackScope: this,
    loop: true
  });

  // 添加提示文本
  const text = this.add.text(400, 30, '每2秒生成一个橙色方块（最多5个）', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);