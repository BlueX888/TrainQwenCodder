class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.survivalTime = 0; // 生存时间（秒）
    this.timeText = null;
    this.gameOverText = null;
    this.baseEnemySpeed = 120; // 初始敌人速度
    this.currentEnemySpeed = 120; // 当前敌人速度
    this.speedIncreaseRate = 10; // 每秒增加的速度
    this.isGameOver = false;
    this.enemySpawnTimer = null;
    this.survivalTimer = null;
  }

  preload() {
    // 不需要加载外部资源
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

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示生存时间
    this.timeText = this.add.text(16, 16, 'Time: 0s | Speed: 120', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

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

    // 生存时间计时器（每秒更新）
    this.survivalTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateSurvivalTime,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 玩家移动
    const speed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.isGameOver) {
      return;
    }

    // 随机X位置
    const x = Phaser.Math.Between(15, 785);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setVelocityY(this.currentEnemySpeed);
      enemy.setCollideWorldBounds(false);
    }
  }

  updateSurvivalTime() {
    if (this.isGameOver) {
      return;
    }

    this.survivalTime++;
    
    // 增加敌人速度
    this.currentEnemySpeed = this.baseEnemySpeed + (this.survivalTime * this.speedIncreaseRate);
    
    // 更新显示
    this.timeText.setText(
      `Time: ${this.survivalTime}s | Speed: ${Math.floor(this.currentEnemySpeed)}`
    );

    // 更新现有敌人的速度
    this.enemies.children.entries.forEach((enemy) => {
      enemy.setVelocityY(this.currentEnemySpeed);
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有计时器
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.remove();
    }
    if (this.survivalTimer) {
      this.survivalTimer.remove();
    }

    // 停止玩家
    this.player.setVelocity(0);
    this.player.setTint(0xff0000);

    // 停止所有敌人
    this.enemies.children.entries.forEach((e) => {
      e.setVelocity(0);
    });

    // 显示游戏结束信息
    this.gameOverText.setText(
      `GAME OVER!\nSurvival Time: ${this.survivalTime}s\nFinal Speed: ${Math.floor(this.currentEnemySpeed)}`
    );
    this.gameOverText.setVisible(true);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
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
  scene: DodgeGame
};

const game = new Phaser.Game(config);