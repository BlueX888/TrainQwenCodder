class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.maxHealth = 3;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建心形纹理用于血量显示
    const heartGraphics = this.add.graphics();
    heartGraphics.fillStyle(0xff0066, 1);
    heartGraphics.fillCircle(8, 8, 6);
    heartGraphics.fillCircle(16, 8, 6);
    heartGraphics.fillTriangle(4, 12, 20, 12, 12, 24);
    heartGraphics.generateTexture('heart', 24, 24);
    heartGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人，随机位置和速度
    this.enemies = this.physics.add.group();
    
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(50, 300);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(50, 150);
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

    // 创建血量显示UI
    this.createHealthUI();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(10, 50, 'Arrow Keys: Move\nAvoid Red Enemies!', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 游戏状态文本
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '20px',
      fill: '#ffff00'
    });

    // 闪烁计时器引用
    this.blinkTimer = null;
  }

  createHealthUI() {
    // 血量容器
    this.healthContainer = this.add.container(650, 10);

    // 标题
    const healthLabel = this.add.text(0, 0, 'Health: ', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    this.healthContainer.add(healthLabel);

    // 心形图标数组
    this.heartIcons = [];
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.image(80 + i * 30, 12, 'heart');
      this.heartIcons.push(heart);
      this.healthContainer.add(heart);
    }
  }

  updateHealthUI() {
    // 更新心形显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.health) {
        this.heartIcons[i].setAlpha(1);
        this.heartIcons[i].setTint(0xff0066);
      } else {
        this.heartIcons[i].setAlpha(0.3);
        this.heartIcons[i].setTint(0x666666);
      }
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.updateHealthUI();

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌帧
    this.startInvincibility();

    // 添加视觉反馈：轻微击退
    const knockbackX = (player.x - enemy.x) * 3;
    const knockbackY = (player.y - enemy.y) * 3;
    player.setVelocity(knockbackX, knockbackY);

    // 状态提示
    this.statusText.setText(`Hit! Health: ${this.health}`);
    this.time.delayedCall(1000, () => {
      this.statusText.setText('');
    });
  }

  startInvincibility() {
    this.isInvincible = true;

    // 清除之前的闪烁计时器
    if (this.blinkTimer) {
      this.blinkTimer.remove();
    }

    // 创建闪烁效果
    let blinkCount = 0;
    const maxBlinks = 10; // 0.5秒内闪烁10次
    
    this.blinkTimer = this.time.addEvent({
      delay: this.invincibleDuration / maxBlinks,
      callback: () => {
        blinkCount++;
        // 切换玩家透明度
        this.player.alpha = this.player.alpha === 1 ? 0.3 : 1;
        
        if (blinkCount >= maxBlinks) {
          this.endInvincibility();
        }
      },
      repeat: maxBlinks - 1
    });
  }

  endInvincibility() {
    this.isInvincible = false;
    this.player.alpha = 1; // 恢复完全不透明
    
    if (this.blinkTimer) {
      this.blinkTimer.remove();
      this.blinkTimer = null;
    }
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 380, 'Click to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });

    // 更新状态文本
    this.statusText.setText('Game Over - Health: 0');
  }

  update(time, delta) {
    // 游戏结束后不更新
    if (this.health <= 0) {
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

    // 显示无敌状态（可选，用于调试）
    if (this.isInvincible && !this.statusText.text.includes('INVINCIBLE')) {
      // 可以在这里添加额外的无敌状态指示
    }
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);