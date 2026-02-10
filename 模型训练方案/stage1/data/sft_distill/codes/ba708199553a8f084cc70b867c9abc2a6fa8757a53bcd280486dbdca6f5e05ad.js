class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.maxHealth = 3;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建无敌状态纹理（橙色方块）
    const invincibleGraphics = this.add.graphics();
    invincibleGraphics.fillStyle(0xff8800, 1);
    invincibleGraphics.fillRect(0, 0, 32, 32);
    invincibleGraphics.generateTexture('playerInvincible', 32, 32);
    invincibleGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人，在不同位置巡逻
    const enemy1 = this.enemies.create(200, 200, 'enemy');
    enemy1.setVelocityX(100);
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);

    const enemy2 = this.enemies.create(600, 400, 'enemy');
    enemy2.setVelocityX(-120);
    enemy2.setBounce(1);
    enemy2.setCollideWorldBounds(true);

    const enemy3 = this.enemies.create(400, 100, 'enemy');
    enemy3.setVelocityY(80);
    enemy3.setBounce(1);
    enemy3.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量UI
    this.createHealthUI();

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 游戏结束标志
    this.gameOver = false;

    // 闪烁定时器引用
    this.blinkTimer = null;
  }

  createHealthUI() {
    this.healthBarX = 10;
    this.healthBarY = 550;
    this.healthBarWidth = 30;
    this.healthBarHeight = 30;
    this.healthBarSpacing = 10;

    // 创建血量显示容器
    this.healthBars = [];
    
    for (let i = 0; i < this.maxHealth; i++) {
      const x = this.healthBarX + i * (this.healthBarWidth + this.healthBarSpacing);
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0xff0000, 1);
      healthBar.fillRect(x, this.healthBarY, this.healthBarWidth, this.healthBarHeight);
      this.healthBars.push(healthBar);
    }

    // 添加血量标签
    this.add.text(10, 520, 'Health:', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  updateHealthUI() {
    // 更新血量显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.health) {
        this.healthBars[i].setAlpha(1);
      } else {
        this.healthBars[i].setAlpha(0.2);
      }
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible || this.gameOver) {
      return;
    }

    // 扣除1血
    this.health -= 1;
    this.updateHealthUI();
    this.updateStatusText();

    // 检查是否死亡
    if (this.health <= 0) {
      this.handleGameOver();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 开始闪烁效果
    let blinkCount = 0;
    const maxBlinks = 10; // 0.5秒内闪烁10次
    const blinkInterval = this.invincibleDuration / maxBlinks;

    this.blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        
        // 切换纹理实现闪烁（绿色和橙色交替）
        if (blinkCount % 2 === 0) {
          this.player.setTexture('player');
        } else {
          this.player.setTexture('playerInvincible');
        }

        // 闪烁结束
        if (blinkCount >= maxBlinks) {
          this.endInvincibility();
        }
      },
      loop: true
    });

    this.updateStatusText();
  }

  endInvincibility() {
    this.isInvincible = false;
    this.player.setTexture('player');
    
    if (this.blinkTimer) {
      this.blinkTimer.remove();
      this.blinkTimer = null;
    }

    this.updateStatusText();
  }

  handleGameOver() {
    this.gameOver = true;
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 360, 'Press R to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });

    this.updateStatusText();
  }

  updateStatusText() {
    let status = `Health: ${this.health}/${this.maxHealth}`;
    if (this.isInvincible) {
      status += ' | INVINCIBLE';
    }
    if (this.gameOver) {
      status += ' | GAME OVER';
    }
    this.statusText.setText(status);
  }

  update() {
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

new Phaser.Game(config);