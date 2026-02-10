class CollectStarsScene extends Phaser.Scene {
  constructor() {
    super('CollectStarsScene');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalStars = 5;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建星星纹理（黄色五角星）
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xffff00, 1);
    starGraphics.beginPath();
    const starRadius = 12;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = 16 + Math.cos(angle) * starRadius;
      const y = 16 + Math.sin(angle) * starRadius;
      if (i === 0) {
        starGraphics.moveTo(x, y);
      } else {
        starGraphics.lineTo(x, y);
      }
    }
    starGraphics.closePath();
    starGraphics.fillPath();
    starGraphics.generateTexture('star', 32, 32);
    starGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建星星组
    this.stars = this.physics.add.group();
    
    // 随机生成5个星星
    const positions = this.generateRandomPositions(this.totalStars);
    positions.forEach(pos => {
      const star = this.stars.create(pos.x, pos.y, 'star');
      star.setCollideWorldBounds(true);
      star.setBounce(0.5);
      star.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.totalStars}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加背景色
    this.cameras.main.setBackgroundColor('#2c3e50');
  }

  update() {
    // 如果游戏已结束，不再处理移动
    if (this.collectedCount >= this.totalStars) {
      this.player.setVelocity(0, 0);
      return;
    }

    // 玩家移动控制
    const speed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  collectStar(player, star) {
    // 销毁星星
    star.destroy();
    
    // 增加收集计数
    this.collectedCount++;
    
    // 更新文本
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalStars}`);
    
    // 检查是否收集完成
    if (this.collectedCount >= this.totalStars) {
      this.winText.setVisible(true);
      
      // 添加闪烁效果
      this.tweens.add({
        targets: this.winText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  generateRandomPositions(count) {
    const positions = [];
    const margin = 50;
    const minDistance = 80; // 星星之间的最小距离
    
    for (let i = 0; i < count; i++) {
      let validPosition = false;
      let attempts = 0;
      let x, y;
      
      while (!validPosition && attempts < 100) {
        x = Phaser.Math.Between(margin, 800 - margin);
        y = Phaser.Math.Between(margin, 600 - margin);
        
        // 检查是否与玩家初始位置太近
        const distToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
        if (distToPlayer < 100) {
          attempts++;
          continue;
        }
        
        // 检查是否与其他星星太近
        validPosition = true;
        for (let pos of positions) {
          const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (dist < minDistance) {
            validPosition = false;
            break;
          }
        }
        
        attempts++;
      }
      
      positions.push({ x, y });
    }
    
    return positions;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: CollectStarsScene
};

new Phaser.Game(config);