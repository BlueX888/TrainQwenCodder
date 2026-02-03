class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.survivalTime = 0;
    this.enemySpeed = 300;
    this.isGameOver = false;
    this.speedIncreaseRate = 20; // 每秒增加的速度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
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
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
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

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 定时生成敌人（每0.8秒）
    this.enemyTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 每秒更新计时器和速度
    this.survivalTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTime,
      callbackScope: this,
      loop: true
    });

    // 重置提示
    this.restartText = this.add.text(400, 360, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 空格键重启
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.isGameOver) {
        this.scene.restart();
      }
    });
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    // 玩家移动
    const speed = 350;
    
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
    if (this.isGameOver) {
      return;
    }

    // 随机X位置
    const x = Phaser.Math.Between(20, 780);
    const enemy = this.enemies.create(x, -20, 'enemy');
    
    // 设置当前速度
    enemy.setVelocityY(this.enemySpeed);
  }

  updateTime() {
    if (this.isGameOver) {
      return;
    }

    this.survivalTime++;
    this.timeText.setText('Time: ' + this.survivalTime + 's');

    // 增加敌人速度
    this.enemySpeed += this.speedIncreaseRate;
    this.speedText.setText('Speed: ' + Math.floor(this.enemySpeed));

    // 更新现有敌人的速度
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocityY(this.enemySpeed);
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有定时器
    this.enemyTimer.remove();
    this.survivalTimer.remove();

    // 停止所有物理对象
    this.physics.pause();

    // 显示游戏结束信息
    this.gameOverText.setText('GAME OVER!\nSurvived: ' + this.survivalTime + 's');
    this.gameOverText.setVisible(true);

    this.restartText.setText('Press SPACE to restart');
    this.restartText.setVisible(true);

    // 玩家变灰
    this.player.setTint(0x888888);
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