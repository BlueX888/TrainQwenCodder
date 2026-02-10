class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.survivalTime = 0;
    this.timeText = null;
    this.gameOver = false;
    this.enemySpeed = 300;
    this.spawnTimer = null;
    this.speedIncreaseTimer = null;
    this.gameStartTime = 0;
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
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 生存时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 速度显示文本
    this.speedText = this.add.text(16, 50, 'Speed: 300', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 记录游戏开始时间
    this.gameStartTime = this.time.now;

    // 定时生成敌人（每1.5秒）
    this.spawnTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 定时增加敌人速度（每2秒增加50）
    this.speedIncreaseTimer = this.time.addEvent({
      delay: 2000,
      callback: this.increaseSpeed,
      callbackScope: this,
      loop: true
    });

    // 游戏说明
    this.add.text(400, 100, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Avoid the Red Enemies!', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime = (time - this.gameStartTime) / 1000;
    this.timeText.setText('Time: ' + this.survivalTime.toFixed(1) + 's');

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
    this.enemies.children.entries.forEach(enemy => {
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

    // 每次增加50速度
    this.enemySpeed += 50;
    
    // 更新速度显示
    this.speedText.setText('Speed: ' + this.enemySpeed);

    // 更新现有敌人的速度
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocityY(this.enemySpeed);
    });
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    // 停止所有计时器
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }
    if (this.speedIncreaseTimer) {
      this.speedIncreaseTimer.remove();
    }

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红
    this.player.setTint(0xff0000);

    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 250, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const finalTimeText = this.add.text(400, 330, 'Survival Time: ' + this.survivalTime.toFixed(1) + 's', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const finalSpeedText = this.add.text(400, 380, 'Final Speed: ' + this.enemySpeed, {
      fontSize: '28px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 450, 'Click to Restart', {
      fontSize: '24px',
      fill: '#00ff00',
      fontFamily: 'Arial'
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