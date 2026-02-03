class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 0;
    this.enemiesPerWave = 8;
    this.enemySpeed = 80;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 碰撞检测：玩家碰到敌人
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

    // 显示波次文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '32px',
      fill: '#ffffff'
    });

    // 显示敌人计数文本
    this.enemyCountText = this.add.text(16, 56, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 射击冷却
    this.lastFired = 0;
    this.fireRate = 200;

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 更新敌人计数
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)}`);

    // 检查是否所有敌人被消灭
    if (this.isWaveActive && this.enemies.countActive(true) === 0) {
      this.onWaveComplete();
    }

    // 清理出界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y < 0 || bullet.y > 600 || bullet.x < 0 || bullet.x > 800)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.statusText.setText('');

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 使用确定性位置生成敌人
      const x = 100 + (i * 80);
      const y = 50 + ((i % 2) * 50);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        this.enemySpeed * (Math.cos(i * 0.5)),
        this.enemySpeed * (Math.sin(i * 0.5))
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  onWaveComplete() {
    this.isWaveActive = false;
    this.statusText.setText('Wave Complete!\nNext wave in 2s...');

    // 2秒后开始下一波
    this.time.addEvent({
      delay: this.waveDelay,
      callback: this.startNextWave,
      callbackScope: this,
      loop: false
    });
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹击中敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
  }

  playerHitEnemy(player, enemy) {
    // 玩家碰到敌人（可选：添加游戏结束逻辑）
    enemy.destroy();
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

new Phaser.Game(config);