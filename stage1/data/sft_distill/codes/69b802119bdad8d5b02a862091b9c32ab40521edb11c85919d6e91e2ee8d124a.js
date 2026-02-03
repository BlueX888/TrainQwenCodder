class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 8;
    this.maxHealth = 8;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建橙色纹理（无敌状态）
    const invincibleGraphics = this.add.graphics();
    invincibleGraphics.fillStyle(0xff8800, 1);
    invincibleGraphics.fillRect(0, 0, 40, 40);
    invincibleGraphics.generateTexture('playerInvincible', 40, 40);
    invincibleGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 给每个敌人随机速度
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(-150, 150);
      enemy.setVelocity(velocityX, velocityY);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量条UI
    this.createHealthBar();

    // 创建状态文本
    this.statusText = this.add.text(400, 50, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 游戏结束标志
    this.gameOver = false;

    // 闪烁计时器引用
    this.blinkTimer = null;
  }

  createHealthBar() {
    const barX = 20;
    const barY = 20;
    const barWidth = 200;
    const barHeight = 30;
    const heartSize = 20;
    const heartSpacing = 5;

    // 背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(barX, barY, barWidth, barHeight);

    // 血量格子容器
    this.healthHearts = [];
    
    for (let i = 0; i < this.maxHealth; i++) {
      const heartX = barX + 5 + i * (heartSize + heartSpacing);
      const heartY = barY + 5;
      
      const heart = this.add.graphics();
      heart.fillStyle(0xff0000, 1);
      heart.fillRect(heartX, heartY, heartSize, heartSize);
      
      this.healthHearts.push(heart);
    }

    // 血量文本
    this.healthText = this.add.text(barX + barWidth + 10, barY + barHeight / 2, 
      `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
  }

  updateHealthBar() {
    // 更新血量格子显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.health) {
        this.healthHearts[i].setAlpha(1);
      } else {
        this.healthHearts[i].setAlpha(0.2);
      }
    }

    // 更新文本
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态或游戏结束，不处理碰撞
    if (this.isInvincible || this.gameOver) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.updateHealthBar();

    console.log(`碰撞！当前生命值: ${this.health}`);

    // 检查是否死亡
    if (this.health <= 0) {
      this.health = 0;
      this.handleDeath();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 切换到橙色纹理
    this.player.setTexture('playerInvincible');

    // 闪烁效果
    let blinkCount = 0;
    const maxBlinks = 5; // 0.5秒内闪烁5次
    
    if (this.blinkTimer) {
      this.blinkTimer.remove();
    }

    this.blinkTimer = this.time.addEvent({
      delay: this.invincibleDuration / maxBlinks / 2,
      callback: () => {
        this.player.setAlpha(this.player.alpha === 1 ? 0.3 : 1);
        blinkCount++;
      },
      repeat: maxBlinks * 2 - 1
    });

    // 无敌时间结束
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincibility();
    });

    this.statusText.setText('无敌状态！');
  }

  endInvincibility() {
    this.isInvincible = false;
    this.player.setTexture('player');
    this.player.setAlpha(1);
    this.statusText.setText('');
    
    if (this.blinkTimer) {
      this.blinkTimer.remove();
      this.blinkTimer = null;
    }

    console.log('无敌状态结束');
  }

  handleDeath() {
    this.gameOver = true;
    this.physics.pause();
    
    this.player.setTint(0x666666);
    this.player.setAlpha(1);

    this.statusText.setText('游戏结束！');
    this.statusText.setStyle({ fontSize: '32px', color: '#ff0000' });

    console.log('游戏结束！生命值归零');
  }

  update(time, delta) {
    if (this.gameOver) {
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
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);