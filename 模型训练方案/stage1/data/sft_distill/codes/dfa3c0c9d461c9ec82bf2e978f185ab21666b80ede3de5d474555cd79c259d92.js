class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.survivalTime = 0; // 生存时间（秒）
    this.baseEnemySpeed = 80; // 初始敌人速度
    this.currentEnemySpeed = 80; // 当前敌人速度
    this.speedIncreaseRate = 5; // 每秒增加的速度
    this.gameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每0.8秒）
    this.enemySpawnTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // UI文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.speedText = this.add.text(16, 50, 'Enemy Speed: 80', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(400, 300, 'Use Arrow Keys to Move\nAvoid Red Enemies!', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.instructionText.setOrigin(0.5);

    // 2秒后移除提示文本
    this.time.delayedCall(2000, () => {
      if (this.instructionText) {
        this.instructionText.destroy();
      }
    });

    // 游戏开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);

    // 更新敌人速度（每秒增加）
    this.currentEnemySpeed = this.baseEnemySpeed + (this.survivalTime * this.speedIncreaseRate);
    this.speedText.setText(`Enemy Speed: ${Math.floor(this.currentEnemySpeed)}`);

    // 玩家移动
    const playerSpeed = 300;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }

    // 更新现有敌人的速度
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        enemy.body.velocity.y = this.currentEnemySpeed;
      }
    });

    // 移除超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 620) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 随机X位置
    const x = Phaser.Math.Between(30, 770);
    
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(this.currentEnemySpeed);
    enemy.body.setCircle(15);
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    // 停止所有定时器
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.remove();
    }

    // 停止所有移动
    this.player.setVelocity(0, 0);
    this.enemies.setVelocityY(0);

    // 玩家变色表示死亡
    this.player.setTint(0xff0000);

    // 显示游戏结束信息
    const finalTime = this.survivalTime.toFixed(2);
    const gameOverText = this.add.text(400, 300, `GAME OVER!\n\nSurvival Time: ${finalTime}s\nFinal Speed: ${Math.floor(this.currentEnemySpeed)}\n\nClick to Restart`, {
      fontSize: '32px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 20 }
    });
    gameOverText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
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
  scene: DodgeGameScene
};

new Phaser.Game(config);