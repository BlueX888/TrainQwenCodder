class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.survivalTime = 0;
    this.timeText = null;
    this.gameOver = false;
    this.baseEnemySpeed = 160;
    this.currentEnemySpeed = 160;
    this.speedIncreaseRate = 10; // 每秒增加的速度
    this.lastSpeedUpdate = 0;
    this.enemySpawnTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
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

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建生存时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 添加速度显示文本
    this.speedText = this.add.text(16, 50, 'Speed: 160', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 定时生成敌人（每0.8秒生成一个）
    this.enemySpawnTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 初始化时间
    this.survivalTime = 0;
    this.lastSpeedUpdate = 0;
    this.gameOver = false;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta / 1000;
    this.timeText.setText('Time: ' + this.survivalTime.toFixed(1) + 's');

    // 每秒增加敌人速度
    if (Math.floor(this.survivalTime) > this.lastSpeedUpdate) {
      this.lastSpeedUpdate = Math.floor(this.survivalTime);
      this.currentEnemySpeed = this.baseEnemySpeed + (this.lastSpeedUpdate * this.speedIncreaseRate);
      this.speedText.setText('Speed: ' + Math.floor(this.currentEnemySpeed));
      
      // 更新现有敌人的速度
      this.enemies.children.entries.forEach(enemy => {
        if (enemy.active) {
          enemy.setVelocityY(this.currentEnemySpeed);
        }
      });
    }

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 620) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.body.enable = false;
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 从对象池获取或创建敌人
    const enemy = this.enemies.get(Phaser.Math.Between(50, 750), -30, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.enable = true;
      enemy.setVelocityY(this.currentEnemySpeed);
      enemy.setVelocityX(0);
    }
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    // 停止物理引擎
    this.physics.pause();

    // 玩家变红表示失败
    player.setTint(0xff0000);

    // 停止生成敌人
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.remove();
    }

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 250, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 8
    });
    gameOverText.setOrigin(0.5);

    const finalTimeText = this.add.text(400, 330, 'Survival Time: ' + this.survivalTime.toFixed(1) + 's', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    finalTimeText.setOrigin(0.5);

    const restartText = this.add.text(400, 400, 'Click to Restart', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    restartText.setOrigin(0.5);

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
  scene: DodgeGame
};

new Phaser.Game(config);