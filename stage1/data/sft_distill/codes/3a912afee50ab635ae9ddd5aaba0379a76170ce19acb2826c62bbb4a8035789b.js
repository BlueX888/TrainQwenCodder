class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesPerWave = 3;
    this.enemySpeed = 80;
    this.waveDelay = 2000;
    this.totalKills = 0;
    this.isWaveActive = false;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 80, '', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startWave();
  }

  update() {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
      this.canShoot = false;
      this.time.delayedCall(300, () => {
        this.canShoot = true;
      });
    }

    // 清理超出屏幕的敌人和子弹
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 620) {
        enemy.destroy();
      }
    });

    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -20) {
        bullet.destroy();
      }
    });

    // 更新UI
    this.updateUI();

    // 检查波次是否完成
    if (this.isWaveActive && this.enemies.getChildren().length === 0) {
      this.completeWave();
    }
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 6, 12);
    bulletGraphics.generateTexture('bullet', 6, 12);
    bulletGraphics.destroy();
  }

  startWave() {
    this.isWaveActive = true;
    
    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 使用固定间隔生成位置，确保确定性
      const x = 150 + (i * 250);
      const enemy = this.enemies.create(x, 50, 'enemy');
      enemy.setVelocityY(this.enemySpeed);
      enemy.body.setCircle(20);
    }
  }

  completeWave() {
    this.isWaveActive = false;
    this.currentWave++;

    // 显示波次完成提示
    const completeText = this.add.text(400, 300, `Wave ${this.currentWave - 1} Complete!`, {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      completeText.destroy();
      this.startWave();
    });
  }

  shoot() {
    const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
    if (bullet) {
      bullet.setVelocityY(-400);
      bullet.body.setSize(6, 12);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    this.totalKills++;

    // 创建爆炸效果
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff0000, 1);
    explosion.fillCircle(enemy.x, enemy.y, 30);
    this.time.delayedCall(100, () => {
      explosion.destroy();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies Remaining: ${this.enemies.getChildren().length}`);
    this.killsText.setText(`Total Kills: ${this.totalKills}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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