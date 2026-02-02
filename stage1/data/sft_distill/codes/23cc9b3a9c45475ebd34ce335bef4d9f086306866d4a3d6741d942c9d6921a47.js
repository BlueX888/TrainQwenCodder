class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.starCount = 0;
    this.maxStars = 12;
    this.timerEvent = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色星形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.lineStyle(2, 0x00ffff, 1);
    
    // 绘制星形
    const starPoints = [];
    const outerRadius = 20;
    const innerRadius = 10;
    const numPoints = 5;
    
    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      starPoints.push({
        x: 25 + Math.cos(angle) * radius,
        y: 25 + Math.sin(angle) * radius
      });
    }
    
    graphics.beginPath();
    graphics.moveTo(starPoints[0].x, starPoints[0].y);
    for (let i = 1; i < starPoints.length; i++) {
      graphics.lineTo(starPoints[i].x, starPoints[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // 生成纹理
    graphics.generateTexture('star', 50, 50);
    graphics.destroy();

    // 创建定时器，每2.5秒生成一个星形
    this.timerEvent = this.time.addEvent({
      delay: 2500, // 2.5秒
      callback: this.spawnStar,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示星形数量
    this.countText = this.add.text(10, 10, 'Stars: 0/12', {
      fontSize: '24px',
      color: '#00ffff'
    });
  }

  spawnStar() {
    // 检查是否已达到最大数量
    if (this.starCount >= this.maxStars) {
      this.timerEvent.remove(); // 停止定时器
      this.countText.setText('Stars: 12/12 - Complete!');
      return;
    }

    // 生成随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);

    // 创建星形精灵
    const star = this.add.image(x, y, 'star');
    
    // 添加简单的缩放动画效果
    this.tweens.add({
      targets: star,
      scale: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });

    // 更新计数
    this.starCount++;
    this.countText.setText(`Stars: ${this.starCount}/12`);
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);