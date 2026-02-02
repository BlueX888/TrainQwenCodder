class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.starCount = 0;
    this.maxStars = 15;
    this.timerEvent = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建黄色星形纹理
    this.createStarTexture();

    // 添加定时器，每4秒生成一个星形
    this.timerEvent = this.time.addEvent({
      delay: 4000,                    // 4秒
      callback: this.spawnStar,       // 回调函数
      callbackScope: this,            // 回调作用域
      loop: true                      // 循环执行
    });

    // 显示提示文本
    this.add.text(10, 10, 'Stars: 0 / 15', {
      fontSize: '24px',
      color: '#ffffff'
    }).setName('counterText');
  }

  /**
   * 创建星形纹理
   */
  createStarTexture() {
    const graphics = this.add.graphics();
    
    // 绘制黄色星形
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.lineStyle(2, 0xffa500, 1); // 橙色边框

    // 星形参数
    const centerX = 32;
    const centerY = 32;
    const outerRadius = 30;
    const innerRadius = 15;
    const points = 5;

    // 绘制五角星
    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // 生成纹理
    graphics.generateTexture('star', 64, 64);
    graphics.destroy();
  }

  /**
   * 生成星形
   */
  spawnStar() {
    // 检查是否达到最大数量
    if (this.starCount >= this.maxStars) {
      console.log('已达到最大星形数量，停止生成');
      this.timerEvent.remove(); // 移除定时器
      return;
    }

    // 生成随机位置（避免星形超出边界）
    const padding = 32; // 星形半径
    const x = Phaser.Math.Between(padding, this.scale.width - padding);
    const y = Phaser.Math.Between(padding + 50, this.scale.height - padding);

    // 创建星形精灵
    const star = this.add.image(x, y, 'star');
    
    // 添加缩放动画效果
    star.setScale(0);
    this.tweens.add({
      targets: star,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // 更新计数
    this.starCount++;
    
    // 更新文本显示
    const counterText = this.children.getByName('counterText');
    if (counterText) {
      counterText.setText(`Stars: ${this.starCount} / ${this.maxStars}`);
    }

    console.log(`生成第 ${this.starCount} 个星形，位置: (${x}, ${y})`);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);