class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.gameOver = false;
    this.survivalTime = 0;
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成敌人纹理（白色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每 800ms 生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 显示状态文本
    this.statusText = this.add.text(16, 16, 'Time: 0s | Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER\nPress SPACE to Restart', {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 记录开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      // 游戏结束后，按空格重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.scene.restart();
      }
      return;
    }

    // 更新存活时间和分数
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.score = this.survivalTime * 10;
    this.statusText.setText(`Time: ${this.survivalTime}s | Score: ${this.score}`);

    // 玩家移动控制
    const moveSpeed = 300;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 620) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 在顶部随机 x 位置生成敌人
    const x = Phaser.Math.Between(30, 770);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人下落速度为 300
    enemy.setVelocityY(300);
    enemy.body.setSize(30, 30);
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    // 游戏结束
    this.gameOver = true;
    
    // 停止所有物理运动
    this.physics.pause();
    
    // 停止生成敌人
    this.enemyTimer.remove();
    
    // 玩家变红色
    player.setTint(0xff0000);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    
    // 输出验证信息
    console.log('Game Over! Final Score:', this.score, 'Survival Time:', this.survivalTime);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: DodgeGameScene
};

new Phaser.Game(config);