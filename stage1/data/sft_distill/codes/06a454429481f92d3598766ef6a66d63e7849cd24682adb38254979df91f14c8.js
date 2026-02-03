class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesPerWave = 12;
    this.enemySpeed = 360;
    this.waveTransitionDelay = 2000;
    this.isTransitioning = false;
    this.enemiesRemaining = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    // 生成第一波敌人
    this.spawnWave();
  }

  update(time, delta) {
    if (!this.player.active) return;

    // 玩家移动
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, this.enemySpeed);
      }
    });

    // 更新UI
    this.updateUI();

    // 检查波次完成
    if (!this.isTransitioning && this.enemiesRemaining === 0 && this.enemies.countActive(true) === 0) {
      this.startWaveTransition();
    }
  }

  spawnWave() {
    this.enemiesRemaining = this.enemiesPerWave;
    this.isTransitioning = false;

    const spawnPositions = [
      { x: -32, y: () => Phaser.Math.Between(50, 550) }, // 左边
      { x: 832, y: () => Phaser.Math.Between(50, 550) }, // 右边
      { x: () => Phaser.Math.Between(50, 750), y: -32 }, // 上边
      { x: () => Phaser.Math.Between(50, 750), y: 632 }  // 下边
    ];

    for (let i = 0; i < this.enemiesPerWave; i++) {
      const pos = Phaser.Utils.Array.GetRandom(spawnPositions);
      const x = typeof pos.x === 'function' ? pos.x() : pos.x;
      const y = typeof pos.y === 'function' ? pos.y() : pos.y;

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCircle(16);
      enemy.setBounce(0.5);
      enemy.setCollideWorldBounds(false);
    }

    this.statusText.setText('');
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);
      bullet.setCollideWorldBounds(true);
      bullet.body.onWorldBounds = true;
      
      // 子弹出界后回收
      this.physics.world.on('worldbounds', (body) => {
        if (body.gameObject === bullet) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0);
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0);
    
    enemy.destroy();
    this.enemiesRemaining--;

    // 确保计数不为负
    if (this.enemiesRemaining < 0) {
      this.enemiesRemaining = 0;
    }
  }

  hitPlayer(player, enemy) {
    // 玩家被击中，游戏结束或扣血逻辑
    this.statusText.setText('Hit! Game Over');
    this.scene.pause();
  }

  startWaveTransition() {
    this.isTransitioning = true;
    this.statusText.setText('Wave Complete! Next wave in 2 seconds...');

    this.time.addEvent({
      delay: this.waveTransitionDelay,
      callback: () => {
        this.currentWave++;
        this.spawnWave();
      },
      callbackScope: this
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
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