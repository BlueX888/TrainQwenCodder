// LoadingScene - 负责资源预加载和进度显示
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadProgress = 0; // 可验证的加载进度状态
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建进度条背景
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // 创建进度条
    const progressBar = this.add.graphics();

    // 创建加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 创建百分比文本
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px Arial',
      fill: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      this.loadProgress = Math.floor(value * 100);
      percentText.setText(this.loadProgress + '%');
      
      // 绘制蓝色进度条
      progressBar.clear();
      progressBar.fillStyle(0x0088ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 模拟加载资源 - 使用内置方法生成纹理
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建星星纹理
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xffff00, 1);
    starGraphics.fillStar(16, 16, 5, 8, 16);
    starGraphics.generateTexture('star', 32, 32);
    starGraphics.destroy();

    // 模拟加载延迟（实际项目中这里会加载真实资源）
    for (let i = 0; i < 10; i++) {
      this.load.image('dummy' + i, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  }

  create() {
    // 添加过渡提示
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const completeText = this.add.text(width / 2, height / 2, 'Loading Complete!\nStarting Game...', {
      font: '24px Arial',
      fill: '#00ff00',
      align: 'center'
    });
    completeText.setOrigin(0.5, 0.5);

    // 延迟后切换到主场景
    this.time.delayedCall(1000, () => {
      this.scene.start('MainScene', { loadProgress: this.loadProgress });
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0; // 可验证的分数状态
    this.gameStarted = false; // 可验证的游戏状态
  }

  init(data) {
    // 接收从LoadingScene传递的数据
    console.log('Loaded with progress:', data.loadProgress);
  }

  create() {
    this.gameStarted = true;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示标题
    const titleText = this.add.text(width / 2, 50, 'Main Game Scene', {
      font: 'bold 32px Arial',
      fill: '#ffffff'
    });
    titleText.setOrigin(0.5, 0.5);

    // 显示加载成功信息
    const infoText = this.add.text(width / 2, 100, 'All resources loaded successfully!', {
      font: '18px Arial',
      fill: '#00ff00'
    });
    infoText.setOrigin(0.5, 0.5);

    // 创建玩家精灵
    const player = this.add.sprite(width / 2, height / 2, 'player');
    player.setScale(2);

    // 创建敌人
    const enemy = this.add.sprite(width / 2 - 100, height / 2 + 100, 'enemy');
    enemy.setScale(1.5);

    // 创建星星
    const star = this.add.sprite(width / 2 + 100, height / 2 + 100, 'star');
    star.setScale(1.5);

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      font: '20px Arial',
      fill: '#ffffff'
    });

    // 添加简单的交互
    this.input.on('pointerdown', () => {
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
      
      // 简单的动画效果
      this.tweens.add({
        targets: player,
        scaleX: 2.5,
        scaleY: 2.5,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });
    });

    // 添加旋转动画
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });

    // 添加浮动动画
    this.tweens.add({
      targets: enemy,
      y: enemy.y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加提示文本
    const hintText = this.add.text(width / 2, height - 50, 'Click anywhere to increase score!', {
      font: '16px Arial',
      fill: '#888888'
    });
    hintText.setOrigin(0.5, 0.5);
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene], // 场景顺序：先LoadingScene后MainScene
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出可验证的状态访问器（用于测试）
if (typeof window !== 'undefined') {
  window.getGameState = () => {
    const loadingScene = game.scene.getScene('LoadingScene');
    const mainScene = game.scene.getScene('MainScene');
    return {
      loadProgress: loadingScene ? loadingScene.loadProgress : 0,
      score: mainScene ? mainScene.score : 0,
      gameStarted: mainScene ? mainScene.gameStarted : false
    };
  };
}