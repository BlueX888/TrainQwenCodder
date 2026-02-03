// 全局信号对象，用于验证状态
window.__signals__ = {
  loadingProgress: 0,
  loadingComplete: false,
  mainSceneActive: false,
  timestamp: Date.now()
};

// LoadingScene - 加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    console.log('[LoadingScene] preload started');
    
    // 创建进度条背景
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    // 添加加载文本
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);
    
    // 监听加载进度
    this.load.on('progress', (value) => {
      console.log(`[LoadingScene] Loading progress: ${Math.floor(value * 100)}%`);
      
      // 更新进度条 - 使用青色 (cyan: 0x00ffff)
      progressBar.clear();
      progressBar.fillStyle(0x00ffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      
      // 更新百分比文本
      percentText.setText(Math.floor(value * 100) + '%');
      
      // 更新全局信号
      window.__signals__.loadingProgress = value;
    });
    
    // 监听加载完成
    this.load.on('complete', () => {
      console.log('[LoadingScene] Loading complete');
      window.__signals__.loadingComplete = true;
      
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    
    // 模拟加载资源 - 使用Graphics生成纹理
    // 生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 生成敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
    
    // 生成道具纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    itemGraphics.generateTexture('item', 32, 32);
    itemGraphics.destroy();
    
    // 使用假图片路径模拟加载延迟（会失败但产生加载时间）
    for (let i = 0; i < 10; i++) {
      this.load.image(`fake${i}`, `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`);
    }
  }

  create() {
    console.log('[LoadingScene] create started');
    
    // 显示"加载完成"提示
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const completeText = this.add.text(width / 2, height / 2, 'Loading Complete!', {
      font: '24px monospace',
      fill: '#00ffff'
    });
    completeText.setOrigin(0.5, 0.5);
    
    // 延迟1秒后切换到主场景
    this.time.delayedCall(1000, () => {
      console.log('[LoadingScene] Switching to MainScene');
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0;
    this.level = 1;
  }

  create() {
    console.log('[MainScene] create started');
    window.__signals__.mainSceneActive = true;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // 显示标题
    const titleText = this.add.text(width / 2, 50, 'Main Scene', {
      font: 'bold 32px monospace',
      fill: '#00ffff'
    });
    titleText.setOrigin(0.5, 0.5);
    
    // 显示加载的资源
    const player = this.add.image(200, height / 2, 'player');
    const playerLabel = this.add.text(200, height / 2 + 40, 'Player', {
      font: '16px monospace',
      fill: '#ffffff'
    });
    playerLabel.setOrigin(0.5, 0.5);
    
    const enemy = this.add.image(400, height / 2, 'enemy');
    const enemyLabel = this.add.text(400, height / 2 + 40, 'Enemy', {
      font: '16px monospace',
      fill: '#ffffff'
    });
    enemyLabel.setOrigin(0.5, 0.5);
    
    const item = this.add.image(600, height / 2, 'item');
    const itemLabel = this.add.text(600, height / 2 + 40, 'Item', {
      font: '16px monospace',
      fill: '#ffffff'
    });
    itemLabel.setOrigin(0.5, 0.5);
    
    // 显示状态信息
    const statusText = this.add.text(20, height - 80, '', {
      font: '14px monospace',
      fill: '#00ffff'
    });
    
    const updateStatus = () => {
      statusText.setText([
        `Score: ${this.score}`,
        `Level: ${this.level}`,
        `Time: ${Math.floor(this.time.now / 1000)}s`
      ]);
      
      // 更新全局信号
      window.__signals__.score = this.score;
      window.__signals__.level = this.level;
      window.__signals__.gameTime = Math.floor(this.time.now / 1000);
    };
    
    updateStatus();
    
    // 每秒更新一次分数和状态
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        if (this.score % 50 === 0) {
          this.level++;
        }
        updateStatus();
      },
      loop: true
    });
    
    // 添加简单的交互提示
    const hintText = this.add.text(width / 2, height - 30, 'Resources loaded successfully!', {
      font: '16px monospace',
      fill: '#ffffff'
    });
    hintText.setOrigin(0.5, 0.5);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: hintText,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    console.log('[MainScene] Scene setup complete');
    console.log('[Signals]', JSON.stringify(window.__signals__, null, 2));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene],
  callbacks: {
    postBoot: function(game) {
      console.log('[Game] Boot complete');
      console.log('[Initial Signals]', JSON.stringify(window.__signals__, null, 2));
    }
  }
};

// 启动游戏
const game = new Phaser.Game(config);