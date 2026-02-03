class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.survivalTime = 0;
    this.timeText = null;
    this.gameOver = false;
    this.enemySpeed = 240;
    this.speedIncreaseTimer = null;
    this.enemySpawnTimer = null;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 20
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建生存时间显示
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建速度显示
    this.speedText = this.add.text(16, 50, 'Speed: 240', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每1秒）
    this.enemySpawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 定时增加敌人速度（每2秒增加30）
    this.speedIncreaseTimer = this.time.addEvent({
      delay: 2000,
      callback: this.increaseSpeed,
      callbackScope: this,
      loop: true
    });

    // 游戏说明
    this.add.text(400, 300, 'Use Arrow Keys to Move\nDodge the Red Blocks!', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0.7);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta;
    const seconds = Math.floor(this.survivalTime / 1000);
    this.timeText.setText('Time: ' + seconds + 's');

    // 玩家移动
    const speed = 300;
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

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
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
    
    // 创建敌人
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(this.enemySpeed);
  }

  increaseSpeed() {
    if (this.gameOver) {
      return;
    }

    // 增加速度
    this.enemySpeed += 30;
    this.speedText.setText('Speed: ' + this.enemySpeed);

    // 更新所有现有敌人的速度
    this.enemies.children.entries.forEach((enemy) => {
      enemy.setVelocityY(this.enemySpeed);
    });
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    // 停止所有计时器
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.remove();
    }
    if (this.speedIncreaseTimer) {
      this.speedIncreaseTimer.remove();
    }

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红
    this.player.setTint(0xff0000);

    // 显示游戏结束信息
    const finalTime = Math.floor(this.survivalTime / 1000);
    const gameOverText = this.add.text(400, 300, 
      'GAME OVER!\nSurvival Time: ' + finalTime + 's\nFinal Speed: ' + this.enemySpeed + '\n\nClick to Restart', {
      fontSize: '32px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 20 }
    }).setOrigin(0.5);

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